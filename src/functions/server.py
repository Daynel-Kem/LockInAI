from flask import Flask, jsonify, request
from appLogic import MyApp
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app)

detector = MyApp(socketio)

@app.route("/start", methods=["POST"])
def start():
    data = request.json
    banned_words = data.get("banned")
    config = data.get("config")

    """
    Json bodies should be in the form of
        {
            "banned": [array of strings]
            "config": [bool, bool, bool]
        }
    where [bool, bool, bool] = [nose, yawn, nail]
    and   [array of strings] = [list of banned words]
    """

    #print(banned_words, config)
    detector.start(banned_words, config)
    return jsonify({"status": "started"}, 200)

@app.route("/stop", methods=["POST"])
def stop():
    detector.stop()
    return jsonify({"status": "stopped"}, 200)

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "running" if detector.status else "stopped"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, allow_unsafe_werkzeug=True)
