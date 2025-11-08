from flask import Flask, jsonify
from flask_cors import CORS
from appLogic import start, stop, MyApp

app = Flask(__name__)
CORS(app)

my_app = MyApp()

@app.route("/start", methods=["POST"])
def start():
    my_app.start()
    return jsonify({"status": "started"}, 200)

@app.route("/stop", methods=["POST"])
def stop():
    my_app.stop()
    return jsonify({"status": "stopped"}, 200)

@app.route("/status", methods=["GET"])
def status():
    return jsonify({"status": my_app.status if "running" else "stopped"})




if __name__ == "__main__":
    app.run_app(app, port=8000)