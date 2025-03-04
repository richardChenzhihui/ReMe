import os
from app import create_app
from dotenv import load_dotenv
from waitress import serve

load_dotenv()

print(os.environ.get("DEBUG"))

app = create_app()

if __name__ == "__main__":
    if os.environ.get("DEBUG") == "True":
        app.run(host="0.0.0.0", debug=True)
    else:
        print("Non-debug mode")
        serve(app, host="0.0.0.0", port=5000, threads=8, backlog=2048)
