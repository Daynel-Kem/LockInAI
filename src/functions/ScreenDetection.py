import platform
import pywinctl
#install
#pip install pywinctl pygetwindow

def get_active_window_title():
    try:
        return pywinctl.getActiveWindowTitle()
    except Exception as e:
        return ""

import time

while True:
    print(get_active_window_title())
    time.sleep(3)

banned_words = ["youtube", "instagram", "tiktok", "porn", "game"]