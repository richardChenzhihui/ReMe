from app import db
from datetime import datetime


class Lifelog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    timestamp_ms = db.Column(db.Integer, nullable=False)  # ms timestamp of the lifelog, align with the frontend
    title = db.Column(db.String(128), nullable=False)
    tags = db.Column(db.JSON)
    content = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "timestamp_ms": self.timestamp_ms,
            "title": self.title,
            "tags": self.tags,
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
