from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models.user import Survey, User


@dataclass
class RegistrationDTO:
    phone: str
    password: str
    name: str = None
    gender: str = None
    birthdate_year: str = None
    birthdate_month: str = None


class PhoneAlreadyExistsError(Exception):
    pass


class UserService:
    @staticmethod
    def create_user(dto: RegistrationDTO) -> User:
        if not dto.phone or not dto.password:
            raise ValueError("Phone and password are required")

        existing_user = User.query.filter_by(phone=dto.phone).first()
        if existing_user:
            raise PhoneAlreadyExistsError(f"Phone number {dto.phone} is already registered")

        hashed_password = generate_password_hash(dto.password)
        user = User(
            phone=dto.phone,
            password=hashed_password,
            name=dto.name,
            gender=dto.gender,
            birthdate_year=dto.birthdate_year,
            birthdate_month=dto.birthdate_month,
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_phone(phone: str) -> Optional[User]:
        return User.query.filter_by(phone=phone).first()

    @staticmethod
    def authenticate_user(phone: str, password: str) -> Optional[User]:
        user = UserService.get_user_by_phone(phone)
        if user and check_password_hash(user.password, password):
            return user
        return None

    @staticmethod
    def change_password(user_id: int, new_password: str) -> bool:
        user = User.query.get(user_id)
        if user:
            user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            return True
        return False

    @staticmethod
    def delete_user(user_id: int) -> None:
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()

    @staticmethod
    def update_survey(user_id: int, survey_data: dict) -> None:
        user = User.query.get(user_id)
        if user:
            survey = Survey.query.filter_by(user_id=user_id).first()
            if survey:
                survey.survey = survey_data
                survey.updated_at = datetime.utcnow()
            else:
                survey = Survey(user_id=user_id, survey=survey_data)
                db.session.add(survey)
            db.session.commit()

    @staticmethod
    def get_survey(user_id: int) -> Optional[dict]:
        survey = Survey.query.filter_by(user_id=user_id).first()
        return survey.survey if survey else None
