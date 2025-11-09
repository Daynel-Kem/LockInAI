# Live Camera Config
nose_picking = True
yawning = True
nail_biting = True

# Configs
BANNED_WORDS_LIST = ["youtube", "instagram", "tiktok", "porn", "game"]
CAMERA_CONFIG = [nose_picking, yawning, nail_biting]

# Setters
# [list of strings]
def set_banned_words(words):
    BANNED_WORDS_LIST = words

def get_banned_words():
    return BANNED_WORDS_LIST

# Four Booleans 
def set_camera_config(nose, yawn, nail):
    CAMERA_CONFIG = [nose, yawn, nail]

def get_camera_config():
    return CAMERA_CONFIG