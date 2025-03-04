from app import db
from datetime import datetime
import uuid


class ChatSession(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    puzzle_name = db.Column(db.String(128), nullable=False)
    language = db.Column(db.String(32), default="en-US", nullable=False)
    timestamp = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=True)
    model_chat_history = db.Column(db.JSON, nullable=False)
    puzzle_instance = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
