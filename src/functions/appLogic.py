import time
import threading
import popup, main, funnysounds, discordbot, filterUgly
from ScreenDetection import get_active_window_title

class MyApp():
    def __init__(self, socketio):
        self.socketio = socketio
        self.status = False
        self.thread = None
        self.banned_words = []
        self.camera_config = []

    # Starts the App
    def start(self, banned_words, camera_config):
        if self.status:
            print("already running")
            return
        self.status = True

        self.banned_words = banned_words
        self.camera_config = camera_config
        print("starting process")
        self.thread = threading.Thread(target=self._process_loop, daemon=True)
        self.thread.start()

    # Run the actual process in a thread
    def _process_loop(self):
        lastWord = -1

        def check_for_banned_words(txt):
            w = -1
            for word in self.banned_words:
                if (word.lower() in txt.lower()):
                    w = word
            return w

        while self.status:
            title = get_active_window_title()

            word = check_for_banned_words(title)
            if (word == -1) :
                lastWord = -1
            else:
                if (lastWord != word):
                    lastWord = word
                    main.you_got_caught(word)
                    self.socketio.emit("change_detected", {"message": "Gooner Detected!"})

            time.sleep(0.1)


    def stop(self):
        if not self.status:
            print("not running rn")
            return
        print("stopping app")
        self.status = False
        if self.thread:
            self.thread.join()
        print("Stopped")
    