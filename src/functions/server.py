from flask import Flask, jsonify, request
from appLogic import MyApp
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

detector = MyApp(socketio)

@app.route("/start", methods=["POST", "OPTIONS"])
def start():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        print(f"🔹 RAW REQUEST BODY: {request.get_data()}")  # ADD THIS
        data = request.json
        print(f"🔹 PARSED JSON: {data}")  # ADD THIS
        banned_words = data.get("banned")
        config = data.get("config")
        print(f"🔹 BANNED: {banned_words}")  # ADD THIS
        print(f"🔹 CONFIG: {config}")  # ADD THIS
        
        detector.start(banned_words, config)
        return jsonify({"status": "started"}), 200
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


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, allow_unsafe_werkzeug=True)
