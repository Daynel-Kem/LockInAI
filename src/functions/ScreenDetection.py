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
    

# while True:
#     title = get_active_window_title()

#     word = check_for_banned_words(title)
#     if (word == -1) :
#         lastWord = -1
#     else:
#         if (lastWord != word):
#             lastWord = word
#             main.you_got_caught(word)


    
#     time.sleep(0.1)


