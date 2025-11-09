from flask import Flask, jsonify
from appLogic import MyApp
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
CORS(app)

detector = MyApp(socketio)

@app.route("/start", methods=["POST"])
def start():
    detector.start()
    return jsonify({"status": "started"}, 200)

@app.route("/stop", methods=["POST"])
def stop():
    detector.stop()
    return jsonify({"status": "stopped"}, 200)

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": "running" if detector.status else "stopped"})


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5050, debug=True)
