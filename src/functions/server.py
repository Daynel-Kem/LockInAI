from flask import Flask, jsonify, request
from appLogic import MyApp
from flask_socketio import SocketIO
from flask_cors import CORS
import database

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

detector = MyApp(socketio)

@app.route("/start", methods=["POST", "OPTIONS"])
def start():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        print(f"🔹 RAW REQUEST BODY: {request.get_data()}")
        data = request.json
        print(f"🔹 PARSED JSON: {data}")

        banned_words = data.get("banned")
        config = data.get("config")
        username = data.get("username", "Anonymous")  # Get username from request

        print(f"🔹 BANNED: {banned_words}")
        print(f"🔹 CONFIG: {config}")
        print(f"🔹 USERNAME: {username}")

        detector.start(banned_words, config, username)
        return jsonify({"status": "started", "username": username}), 200
    except Exception as e:
        print("error has occured: ", e)
        return jsonify({"error": str(e)}), 500

@app.route("/stop", methods=["POST", "OPTIONS"])
def stop():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200  # Preflight response
    
    try:
        detector.stop()
        return jsonify({"status": "stopped"}, 200)
    except Exception as e:
        print("error has occured stopping: ", e)
        return jsonify({"error": e}), 500

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "running" if detector.status else "stopped"})


@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    """Get leaderboard rankings."""
    try:
        event_type = request.args.get("event_type")  # Optional filter
        limit = int(request.args.get("limit", 10))
        days = request.args.get("days")  # Optional time filter
        if days:
            days = int(days)

        results = database.get_leaderboard(event_type=event_type, limit=limit, days=days)
        return jsonify({"leaderboard": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/user-stats/<username>", methods=["GET"])
def user_stats(username):
    """Get detailed stats for a specific user."""
    try:
        stats = database.get_user_stats(username)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/recent-detections", methods=["GET"])
def recent_detections():
    """Get recent detections across all users."""
    try:
        limit = int(request.args.get("limit", 20))
        detections = database.get_recent_detections(limit=limit)
        return jsonify({"detections": detections}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/event-types", methods=["GET"])
def event_types():
    """Get all unique event types."""
    try:
        types = database.get_event_types()
        return jsonify({"event_types": types}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, allow_unsafe_werkzeug=True)
