import time
import threading
from pynput import keyboard   # 👈 use pynput instead of keyboard
import popup, main, funnysounds, discordbot, filterUgly
from ScreenDetection import get_active_window_title


class MyApp():
    def __init__(self, socketio):
        self.socketio = socketio
        self.status = False
        self.thread = None
        self.banned_words = []
        self.camera_config = []
        self.username = "Anonymous"

    # Starts the App
    def start(self, banned_words, camera_config, username="Anonymous"):
        if self.status:
            print("already running")
            return

        self.status = True
        self.banned_words = banned_words
        self.camera_config = camera_config
        self.username = username

        print(f"starting process for user: {username}")

        # start main detection loop
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()

        # start hidden key listener thread
        threading.Thread(target=self._listen_for_keys, daemon=True).start()

    # 👇 Hidden key listener (no sudo needed)
    def _listen_for_keys(self):
        print("🔵 FakeGooning active — press 'g' to trigger videoDetected() (when terminal is focused)")

        def on_press(key):
            try:
                if key.char == "g":  # listen for lowercase g
                    print("Manual trigger detected")
                    threading.Thread(
                        target=self.videoDetected, args=("gooning",), daemon=True
                    ).start()
                if key.char == "y":  # listen for lowercase g
                    print("Manual trigger detected")
                    threading.Thread(
                        target=self.videoDetected, args=("yawning",), daemon=True
                    ).start()
                if key.char == "n":  # listen for lowercase g
                    print("Manual trigger detected")
                    threading.Thread(
                        target=self.videoDetected, args=("nose picking",), daemon=True
                    ).start()
                if key.char == "b":  # listen for lowercase g
                    print("Manual trigger detected")
                    threading.Thread(
                        targext=self.videoDetected, args=("nail biting",), daemon=True
                    ).start()
            except AttributeError:
                pass  # ignore non-character keys

        listener = keyboard.Listener(on_press=on_press)
        listener.start()
        listener.join()

    # Main screen-detection loop
    def _process_loop(self):
        lastWord = -1

        def check_for_banned_words(txt):
            w = -1
            for word in self.banned_words:
                if word.lower() in txt.lower():
                    w = word
            return w

        while self.status:
            title = get_active_window_title()
            word = check_for_banned_words(title)

            if word == -1:
                lastWord = -1
            elif lastWord != word:
                lastWord = word
                main.you_got_caught(word, self.username)
                self.socketio.emit("change_detected", {"message": "Gooner Detected!"})

            time.sleep(0.1)

    # Called when video or manual trigger happens
    def videoDetected(self, reason):
        main.you_got_caught(reason, self.username)
        self.socketio.emit("change_detected", {"message": "Gooner Detected!"})

    # Stop everything cleanly
    def stop(self):
        if not self.status:
            print("not running rn")
            return

        print("stopping app")
        self.status = False
        if self.thread:
            self.thread.join()
        print("Stopped")