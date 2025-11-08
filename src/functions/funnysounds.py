from playsound import playsound
import random

sounds = ["alert.mp3","spongebob.wav"]

# Play funny sound effect when detection happens
try:
    random_sound = random.choice(sounds)
    print(f"Trying to play: {random_sound}")
    playsound(random_sound)
    print("Sound played successfully!") 
except Exception as e:
    print(f"⚠️ Could not play sound file: {e}")