from playsound import playsound
import random
import os

def play_funny_sound():
    """Plays a random funny sound"""
    
    # Path to this script's directory
    base_dir = os.path.dirname(__file__)
    
    # Sound file paths relative to this file
    sounds = [
        os.path.join(base_dir, "dexter.wav"),
        os.path.join(base_dir, "spongebob.wav")
    ]

    try:
        random_sound = random.choice(sounds)
        print(f"🎵 Playing: {random_sound}")
        playsound(random_sound)
        print("✅ Sound played successfully!")
    except Exception as e:
        print(f"⚠️ Could not play sound file: {e}")

play_funny_sound()