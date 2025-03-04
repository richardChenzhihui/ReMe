import os
from datetime import datetime, timedelta
from typing import List

from flask import current_app, url_for

from app import db
from app.models.lifelog import Lifelog
from app.utils.local_file_manager import save_base64_to_file


class LifelogService:
    @staticmethod
    def local_file_to_url(filepath: str) -> str:
        file_name = os.path.basename(filepath)
        file_url = url_for("static", filename=file_name)
        return file_url

    @staticmethod
    def create_lifelog(user_id: int, timestamp_ms: int, title: str, tags: List[str], content: str) -> Lifelog:
        # save image to file and replace image data with url
        for message in content:
            if message["type"] == "image":
                filepath, url = save_base64_to_file(message["data"], "lifelogs")
                message["data"] = filepath

        lifelog = Lifelog(user_id=user_id, timestamp_ms=timestamp_ms, content=content, title=title, tags=tags)
        db.session.add(lifelog)
        db.session.commit()
        return lifelog

    @staticmethod
    def get_lifelog(user_id: int, lifelog_id: int) -> Lifelog:
        return Lifelog.query.filter_by(user_id=user_id, id=lifelog_id).first()

    @staticmethod
    def get_lifelogs_for_user(user_id: int, page: int = None, page_size: int = None, year: int = None) -> List[Lifelog]:
        query = Lifelog.query.filter_by(user_id=user_id)

        if year:
            start_date = datetime(year, 1, 1)
            end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            query = query.filter(Lifelog.timestamp_ms >= start_date.timestamp() * 1000, Lifelog.timestamp_ms <= end_date.timestamp() * 1000)

        if page and page_size:
            paginated_lifelogs = query.order_by(Lifelog.timestamp_ms.desc()).paginate(page=page, per_page=page_size, error_out=False)
            return paginated_lifelogs.items, query.count()

        return query.order_by(Lifelog.timestamp_ms.desc()).all(), query.count()
