import os
from datetime import timedelta


class Config:
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=365)

    SECRET_KEY = os.environ.get("SECRET_KEY") or "you-will-never-guess"
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AOAI_ENDPOINT = os.environ.get("AOAI_ENDPOINT") or ""
    AOAI_TOKEN = os.environ.get("AOAI_TOKEN") or ""
    AOAI_MODEL_NAME = os.environ.get("AOAI_MODEL_NAME") or ""

    USE_TTS = True
    AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY") or ""
    AZURE_SPEECH_SERVICE_REGION = os.environ.get("AZURE_SPEECH_SERVICE_REGION") or ""

    # SERVER_NAME = 'localhost:5000'
    # APPLICATION_ROOT = '/'
    # PREFERRED_URL_SCHEME = 'http'
