import logging
import logging.handlers
from datetime import datetime
from functools import wraps
from queue import Queue

from flask import Response, jsonify, request, session

# Create a queue to hold log records
log_queue = Queue()

# Configure log handler
log_formatter = logging.Formatter("%(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")

rotating_file_handler = logging.handlers.RotatingFileHandler(
    "./api_logs/app_log.log",  # Log file name
    maxBytes=10 * 1024 * 1024,  # Maximum bytes per log file, set to 10MB
    backupCount=1000,  # Number of backup files to keep
)
rotating_file_handler.setFormatter(log_formatter)

queue_handler = logging.handlers.QueueHandler(log_queue)
queue_handler.setFormatter(log_formatter)

# Create logger
logger = logging.getLogger("async_logger")
logger.setLevel(logging.INFO)
logger.addHandler(queue_handler)

# Asynchronous log listener
listener = logging.handlers.QueueListener(log_queue, rotating_file_handler)
listener.start()


# Decorator function
def log_request_info(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = datetime.now()

        # Get request information
        user_id = session.get("user_id", "Anonymous")
        request_url = request.url
        request_data = request.get_json() if request.is_json else request.form.to_dict()

        client_ip = request.remote_addr
        user_agent = request.headers.get("User-Agent", "Unknown")

        # Execute view function
        response = f(*args, **kwargs)

        # Get response information
        end_time = datetime.now()
        # Check if response is of type Response
        if isinstance(response, Response):
            response_data = response.get_json() if response.is_json else response.data.decode("utf-8")
        else:
            # Handle other types of responses if necessary
            response_data = str(response)

        # Put log record into queue
        logger.info(
            f"User ID: {user_id}, URL: {request_url}, "
            f"IP: {client_ip}, Device: {user_agent}, "
            f"Request Data: {request_data}, "
            f"Response Data: {response_data}, "
            f"Request Time: {start_time}, Response Time: {end_time}"
        )

        return response

    return decorated_function
