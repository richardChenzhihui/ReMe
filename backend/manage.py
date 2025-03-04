import os
import shutil

from flask.cli import FlaskGroup
from werkzeug.security import generate_password_hash

from app import create_app, db
from app.models.chat import ChatSession
from app.models.lifelog import Lifelog
from app.models.user import Survey, User

cli = FlaskGroup(create_app=create_app)


@cli.command("clean")
def clean():
    directories_to_clean = [
        "app/static/chat_sessions",
        "app/static/lifelogs",
        "app/static/unattached",
    ]

    for directory in directories_to_clean:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file != ".gitkeep":
                        file_path = os.path.join(root, file)
                        os.remove(file_path)
                        print(f"Deleted file: {file_path}")
                for dir_ in dirs:
                    dir_path = os.path.join(root, dir_)
                    shutil.rmtree(dir_path)
                    print(f"Deleted directory: {dir_path}")
        else:
            print(f"Directory does not exist: {directory}")

    print("Clean-up completed!")


@cli.command("init_db")
def init_db():
    db.drop_all()
    db.create_all()
    print("Database initialized!")


@cli.command("add_table")
def add_table():
    db.create_all()
    print("Table added!")


@cli.command("seed_db")
def seed_db():
    # add some example users
    user1 = User(phone="13800000000", password=generate_password_hash("password123"))
    user2 = User(phone="13900000000", password=generate_password_hash("password456"))
    db.session.add(user1)
    db.session.add(user2)

    # add some example surveys
    survey1 = Survey(user_id=1, survey={"question1": "answer1", "question2": "answer2"})
    survey2 = Survey(user_id=2, survey={"question1": "answer3", "question2": "answer4"})
    db.session.add(survey1)
    db.session.add(survey2)

    db.session.commit()
    print("Database seeded!")


if __name__ == "__main__":
    cli()
