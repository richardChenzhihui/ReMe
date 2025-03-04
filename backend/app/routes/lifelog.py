import json

from flask import Blueprint, jsonify, request, session

from app import db
from app.models.lifelog import Lifelog
from app.services.lifelog_service import LifelogService
from app.utils.auth import login_required
from app.utils.logging import log_request_info

lifelog_bp = Blueprint("lifelog", __name__, url_prefix="/api/v1/lifelog")
lifelog_service = LifelogService()


# POST /: create a lifelog item
@lifelog_bp.route("", methods=["POST"])
@login_required
@log_request_info
def create_lifelog():
    data = request.form.get("data")
    json_data = json.loads(data)
    data = json_data

    timestamp = data.get("timestamp")
    title = data.get("title")
    tags = data.get("tags")
    content = data.get("content")

    if not content:
        return jsonify({"code": 400, "message": "Content is required"}), 400

    lifelog = lifelog_service.create_lifelog(session["user_id"], timestamp, title, tags, content)
    return jsonify({"code": 200, "message": "success", "data": {"id": lifelog.id}})


# GET /?page&page_size&year: get lifelog item list
@lifelog_bp.route("", methods=["GET"])
@login_required
@log_request_info
def get_lifelogs():
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 10, type=int)
    year = request.args.get("year", None, type=int)

    if year:
        lifelogs, total = lifelog_service.get_lifelogs_for_user(session["user_id"], page, page_size, year)
    else:
        lifelogs, total = lifelog_service.get_lifelogs_for_user(session["user_id"], page, page_size)

    if lifelogs:
        # replace image data(local file path) with url in lifelog content
        for lifelog in lifelogs:
            for message in lifelog.content:
                if message["type"] == "image":
                    message["data"] = LifelogService.local_file_to_url(message["data"])

    return jsonify(
        {
            "code": 200,
            "message": "success",
            "data": {
                "page": page,
                "page_size": page_size,
                "total_pages": (total + page_size - 1) // page_size,
                "total_items": total,
                "lifelog": [(lifelog.title, lifelog.timestamp_ms, lifelog.content) for lifelog in lifelogs],
            },
        }
    )


# GET /<int:id>: get a lifelog item
@lifelog_bp.route("/<int:id>", methods=["GET"])
@login_required
@log_request_info
def get_lifelog(id):
    lifelog = lifelog_service.get_lifelog(session["user_id"], id)
    if lifelog:
        # replace image data(local file path) with url in lifelog content
        for message in lifelog.content:
            if message["type"] == "image":
                message["data"] = LifelogService.local_file_to_url(message["data"])

        return jsonify({"code": 200, "message": "success", "data": lifelog.to_dict()})
    else:
        return jsonify({"code": 404, "message": "LifeLog not found"}), 404
