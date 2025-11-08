import tkinter as tk
from PIL import Image, ImageTk
import os

def show_popup_gif(reason):
    """Shows a fullscreen GIF popup when someone gets caught"""
    
    # Create fullscreen window
    popup = tk.Tk()
    popup.attributes('-fullscreen', True)
    popup.attributes('-topmost', True)
    popup.configure(bg='black')
    
    # Path to GIF
    base_dir = os.path.dirname(__file__)
    gif_path = os.path.join(base_dir, "200w.gif")  # Your GIF file
    
    try:
        # Load GIF
        gif = Image.open(gif_path)
        frames = []
        
        # Extract all frames from GIF
        try:
            while True:
                frames.append(ImageTk.PhotoImage(gif.copy()))
                gif.seek(len(frames))  # Move to next frame
        except EOFError:
            pass  # End of GIF
        
        # Create label for GIF
        label = tk.Label(popup, bg='black')
        label.pack(expand=True)
        
        # Add warning text
        text = tk.Label(
            popup, 
            text=f"🚨 CAUGHT ON {reason.upper()}! 🚨\nPosting to Discord...", 
            font=("Arial", 40, "bold"),
            fg="red",
            bg="black"
        )
        text.pack(pady=20)
        
        # Animate GIF
        frame_index = [0]
        
        def update_frame():
            if popup.winfo_exists():
                frame = frames[frame_index[0]]
                label.config(image=frame)
                label.image = frame
                frame_index[0] = (frame_index[0] + 1) % len(frames)
                popup.after(50, update_frame)  # 50ms between frames
        
        update_frame()
        
    except Exception as e:
        # Fallback if GIF doesn't exist
        print(f"Could not load GIF: {e}")
        label = tk.Label(
            popup,
            text=f"🚨 CAUGHT! 🚨\n\nYou got caught on {reason.upper()}!\n\nPosting to Discord...",
            font=("Arial", 60, "bold"),
            fg="red",
            bg="black"
        )
        label.pack(expand=True)
    
    # Close after 3 seconds
    popup.after(3000, popup.destroy)
    popup.mainloop()


    # Get the appropriate GIF or use default
    gif_filename = gif_map.get(reason.lower(), "caught.gif")
    gif_path = os.path.join(base_dir, gif_filename)
    
    try:
        gif = Image.open(gif_path)
        frames = []
        
        try:
            while True:
                frames.append(ImageTk.PhotoImage(gif.copy()))
                gif.seek(len(frames))
        except EOFError:
            pass
        
        label = tk.Label(popup, bg='black')
        label.pack(expand=True)
        
        text = tk.Label(
            popup, 
            text=f"🚨 CAUGHT ON {reason.upper()}! 🚨", 
            font=("Arial", 40, "bold"),
            fg="red",
            bg="black"
        )
        text.pack(pady=20)
        
        frame_index = [0]
        
        def update_frame():
            if popup.winfo_exists():
                frame = frames[frame_index[0]]
                label.config(image=frame)
                label.image = frame
                frame_index[0] = (frame_index[0] + 1) % len(frames)
                popup.after(50, update_frame)
        
        update_frame()
        
    except Exception as e:
        print(f"Could not load GIF: {e}")
        label = tk.Label(
            popup,
            text=f"🚨 CAUGHT! 🚨\n\n{reason.upper()}!",
            font=("Arial", 60, "bold"),
            fg="red",
            bg="black"
        )
        label.pack(expand=True)
    
    popup.after(3000, popup.destroy)
    popup.mainloop()