import json

from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import SQLAlchemyError

from app import db
from app.models.user import Survey, User
from app.services.feedback import FeedbackService
from app.utils.auth import login_required
from app.utils.logging import log_request_info

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/v1/feedback")
feedback_service = FeedbackService()


# POST /upload: upload feedback
@feedback_bp.route("/upload", methods=["POST"])
@login_required
@log_request_info
def upload_feedback():
    data = request.form.get("data")
    json_data = json.loads(data)
    survey_data = json_data

    if not survey_data:
        return jsonify({"code": 400, "message": "Survey data is required"}), 400

    feedback_service.create_feedback(session["user_id"], survey_data)
    return jsonify({"code": 200, "message": "Survey updated successfully"})
