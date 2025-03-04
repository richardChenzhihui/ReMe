from functools import wraps

from flask import jsonify, session


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"code": 401, "message": "Unauthorized"}), 401
        return f(*args, **kwargs)

    return decorated_function
