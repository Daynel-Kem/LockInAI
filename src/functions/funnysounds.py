from playsound import playsound
import random

def play_funny_sound():
    """Plays a random funny sound"""
    try:
        print(f"Playing: spongebob.wav")
        playsound("spongebob.wav")
        print("Sound played successfully!")
    except Exception as e:
        print(f"Could not play sound file: {e}")

play_funny_sound()