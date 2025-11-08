import pygame, os, random, threading, time

def play_alarm_and_funny():
    base_dir = os.path.join(os.path.dirname(__file__), "sounds")

    alarm = os.path.join(base_dir, "sirens.mp3")
    funny_sounds = [
        os.path.join(base_dir, "dexter.mp3"),
        os.path.join(base_dir, "spongebob.mp3"),
        os.path.join(base_dir, "phil.mp3"),
        os.path.join(base_dir, "strange.mp3"),
        os.path.join(base_dir, "walter.mp3")
    ]

    def _play():
        try:
            pygame.mixer.init()

            # 🔊 Step 1: play siren (lower volume)
            pygame.mixer.music.load(alarm)
            pygame.mixer.music.set_volume(0.4)  # 0–1 range (40%)
            pygame.mixer.music.play()
            print("🚨 Siren started (2 seconds)")
            time.sleep(4)  # wait 2 seconds
            pygame.mixer.music.stop()

            # 😂 Step 2: play funny sound looped 3x (full volume)
            random_sound = random.choice(funny_sounds)
            funny = pygame.mixer.Sound(random_sound)
            funny.set_volume(1.0)
            funny.play(loops=1)  # loops=2 → total 3 plays
            print(f"Funny sound: {os.path.basename(random_sound)}")

            # give time for the loops to finish (depends on file length)
            time.sleep(10)

            pygame.mixer.stop()
            pygame.mixer.quit()
            print("Done playing sounds")

        except Exception as e:
            print(f"Sound error: {e}")

    # Run in background so rest of code continues (volume-up, Discord, etc.)
    threading.Thread(target=_play, daemon=True).start()