from flask import Flask, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__,static_folder='static')
    CORS(app, supports_credentials=True)
    
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    from app.routes import user_bp, chat_bp, lifelog_bp, feedback_bp
    app.register_blueprint(user_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(lifelog_bp)
    app.register_blueprint(feedback_bp)

    from app.utils.error_handler import init_error_handlers
    init_error_handlers(app)
    
    @app.before_request
    def make_session_permanent():
        session.permanent = True

    return app