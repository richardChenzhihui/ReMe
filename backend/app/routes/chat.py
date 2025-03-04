import json

from flask import Blueprint, jsonify, request, session

from app import db
from app.models.chat import ChatSession
from app.services.chat_service import ChatService
from app.utils.auth import login_required
from app.utils.logging import log_request_info

chat_bp = Blueprint("chat", __name__, url_prefix="/api/v1/chat")
chat_service = ChatService()


# GET /puzzle: get puzzle name list
@chat_bp.route("/puzzle", methods=["GET"])
@login_required
def get_puzzle_name_list():
    puzzles = chat_service.get_puzzle_name_list()
    return jsonify({"code": 200, "message": "success", "data": {"puzzle_list": puzzles}})


# POST /: create puzzle chat session
@chat_bp.route("", methods=["POST"])
@login_required
@log_request_info
def create_chat_session():
    # make puzzle instance, create session, return session_id and first assistant response (if any)
    data = request.json
    puzzle_name = data.get("puzzle_name")
    language = data.get("language")

    if not puzzle_name:
        return jsonify({"code": 400, "message": "Puzzle ID is required"}), 400

    try:
        chat_session, instruction_message = chat_service.create_chat_session(session["user_id"], puzzle_name, language)
    except ValueError as e:
        return jsonify({"code": 400, "message": "Value Error"}), 400

    return jsonify(
        {
            "code": 200,
            "message": "success",
            "data": {
                "session_id": chat_session.id,
                "user_id": chat_session.user_id,
                "timestamp": chat_session.timestamp,
                "puzzle_name": chat_session.puzzle_name,
                "language": chat_session.language,
                "message": instruction_message,  # TODO add assistant response through puzzle configuration， visualization format of chat_history
            },
        }
    )


# POST /<string:session_id>: post user chat message and get assistant response
@chat_bp.route("/<string:session_id>", methods=["POST"])
@login_required
@log_request_info
def train_chat(session_id):
    # get user chat message, update session, return assistant response
    data = request.form.get("data")
    json_data = json.loads(data)
    raw_user_chat_message = json_data

    if not raw_user_chat_message:
        return jsonify({"code": 400, "message": "Chat message is required"}), 400

    response = chat_service.train_chat(session["user_id"], session_id, raw_user_chat_message)
    return jsonify({"code": 200, "message": "success", "data": response})


# POST /util/asr: speech to text
@chat_bp.route("/util/asr", methods=["POST"])
@login_required
def asr():
    data = request.json
    audio = data.get("audio")

    if not audio:
        return jsonify({"code": 400, "message": "Audio data is required"}), 400

    text = chat_service.speech_to_text(audio)
    return jsonify({"code": 200, "message": "success", "data": text})
