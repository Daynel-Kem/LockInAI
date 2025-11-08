from playsound import playsound
import random

def play_funny_sound():
    """Plays a random funny sound"""
    sounds = ["spongebob.wav"]
    try:
        random_sound = random.choice(sounds)
        print(f"Playing: {random_sound}")
        playsound(random_sound)
        print("Sound played successfully!")
    except Exception as e:
        print(f"⚠️ Could not play sound file: {e}")