from flask import jsonify


def init_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"code": 400, "message": "Bad Request"}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"code": 404, "message": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"code": 500, "message": "Internal Server Error"}), 500
