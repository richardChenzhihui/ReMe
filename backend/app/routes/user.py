from flask import Blueprint, jsonify, request, session
from sqlalchemy.exc import SQLAlchemyError

from app import db
from app.models.user import Survey, User
from app.services.user_service import PhoneAlreadyExistsError, RegistrationDTO, UserService
from app.utils.auth import login_required
from app.utils.logging import log_request_info

user_bp = Blueprint("user", __name__, url_prefix="/api/v1/user")
user_service = UserService()


# POST /register: register a new user
@user_bp.route("/register", methods=["POST"])
@log_request_info
def register():
    data = request.json
    dto = RegistrationDTO(
        phone=data.get("phone"),
        password=data.get("password"),
        name=data.get("name"),
        gender=data.get("gender"),
        birthdate_year=data.get("birthdate_year"),
        birthdate_month=data.get("birthdate_month"),
    )

    if not dto.phone or not dto.password:
        return jsonify({"code": 400, "message": "Phone and password are required"}), 400

    try:
        user = user_service.create_user(dto)
        session["user_id"] = user.id
        return jsonify({"code": 200, "message": "success", "data": {"user_id": user.id, "phone": user.phone}})
    except PhoneAlreadyExistsError as e:
        return jsonify({"code": 400, "message": "Phone Already Exists"}), 400
    except ValueError as e:
        return jsonify({"code": 400, "message": "Value Error"}), 400
    except SQLAlchemyError as e:
        return jsonify({"code": 500, "message": "Internal server error"}), 500


# POST /login: login
@user_bp.route("/login", methods=["POST"])
@log_request_info
@log_request_info
def login():
    data = request.json
    phone = data.get("phone")
    password = data.get("password")

    if not phone or not password:
        return jsonify({"code": 400, "message": "Phone and password are required"}), 400

    user = user_service.authenticate_user(phone, password)
    if user:
        session["user_id"] = user.id
        return jsonify({"code": 200, "message": "success", "data": {"user_id": user.id, "phone": user.phone}})
    else:
        return jsonify({"code": 401, "message": "Invalid credentials"}), 401


# POST /logout: logout
@user_bp.route("/logout", methods=["POST"])
@login_required
@log_request_info
def logout():
    session.pop("user_id", None)
    return jsonify({"code": 200, "message": "success"})


# POST /survey: update user survey
@user_bp.route("/survey", methods=["POST"])
@login_required
@log_request_info
def update_survey():
    data = request.json
    survey_data = data.get("survey")

    if not survey_data:
        return jsonify({"code": 400, "message": "Survey data is required"}), 400

    user_service.update_survey(session["user_id"], survey_data)
    return jsonify({"code": 200, "message": "Survey updated successfully"})


# GET /survey: get user survey
@user_bp.route("/survey", methods=["GET"])
@login_required
@log_request_info
def get_survey():
    survey_data = user_service.get_survey(session["user_id"])
    if survey_data:
        return jsonify({"code": 200, "message": "Survey retrieved successfully", "data": survey_data})
    else:
        return jsonify({"code": 404, "message": "Survey not found"}), 404
