import platform
import pywinctl
import time
import main
#install
#pip install pywinctl pygetwindow

def get_active_window_title():
    try:
        return pywinctl.getActiveWindowTitle()
    except Exception as e:
        return ""

def check_for_banned_words(txt):
    w = -1
    for word in banned_words:
        if (word.lower() in txt.lower()):
            w = word
    return w
    
lastWord = -1
banned_words = ["youtube", "instagram", "tiktok", "porn", "game"]

while True:
    title = get_active_window_title()

    word = check_for_banned_words(title)
    if (word == -1) :
        lastWord = -1
    else:
        if (lastWord != word):
            lastWord = word
            main.you_got_caught(word)


    
    time.sleep(3)


