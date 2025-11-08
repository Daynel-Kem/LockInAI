import time
import threading
import popup, main, funnysounds, discordbot, filterUgly
from ScreenDetection import get_active_window_title, check_for_banned_words

class MyApp():
    def __init__(self):
        self.status = False
        self.thread = None

    # Starts the App
    def start(self):
        if self.status:
            print("already running")
            return
        self.status = True

        print("starting process")
        self.thread = threading.Thread(target=self._process_loop)
        self.thread.start()

    # Run the actual process in a thread
    def _process_loop(self):
        while self.status:
            title = get_active_window_title()

            word = check_for_banned_words(title)
            if (word == -1) :
                lastWord = -1
            else:
                if (lastWord != word):
                    lastWord = word
                    main.you_got_caught(word)

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
        
