from dataclasses import dataclass
from typing import Optional

from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models.feedback import Feedback
from app.models.user import User


class FeedbackService:
    @staticmethod
    def create_feedback(user_id: int, feedback_data: dict) -> None:
        user = User.query.get(user_id)
        if user:
            feedback = Feedback(user_id=user_id, feedback_message=feedback_data)
            db.session.add(feedback)
            db.session.commit()
