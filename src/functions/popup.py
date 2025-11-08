# popup.py
import tkinter as tk
from PIL import Image, ImageTk
import os
import sys

def show_popup_gif(reason):
    """Shows a fullscreen GIF popup when someone gets caught."""

    # --- Setup window ---
    popup = tk.Tk()
    popup.attributes('-fullscreen', True)
    popup.attributes('-topmost', True)
    popup.configure(bg='black')

    # --- Load GIF ---
    base_dir = os.path.dirname(__file__)
    gif_path = os.path.join(base_dir, "200w.gif")  # your gif file
    frames = []
    try:
        gif = Image.open(gif_path)
        while True:
            frames.append(ImageTk.PhotoImage(gif.copy()))
            gif.seek(len(frames))
    except EOFError:
        pass
    except Exception as e:
        print(f"⚠️ Could not load GIF: {e}")

    # --- Create widgets ---
    label = tk.Label(popup, bg='black')
    label.pack(expand=True)

    text = tk.Label(
        popup,
        text=f"🚨 CAUGHT ON {reason.upper()}! 🚨\nPosting to Discord...",
        font=("Arial", 40, "bold"),
        fg="red",
        bg="black"
    )
    text.pack(pady=20)

    # --- Animate frames ---
    if frames:
        idx = {"i": 0}
        def update():
            frame = frames[idx["i"]]
            label.config(image=frame)
            label.image = frame
            idx["i"] = (idx["i"] + 1) % len(frames)
            popup.after(50, update)
        update()

    # --- Auto-close after 3 seconds ---
    popup.after(8000, popup.destroy)
    popup.mainloop()


# --- Allow this file to be run directly ---
if __name__ == "__main__":
    reason = sys.argv[1] if len(sys.argv) > 1 else "slacking"
    show_popup_gif(reason)