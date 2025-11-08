import os, datetime, pyautogui
from PIL import Image


def take_screenshot():
    screenshot = pyautogui.screenshot()
    return screenshot.convert("RGB")

#def get photo (call function to the yolo thingy cv.read() and just return it here )

#def take_photo():
    #blablabla

def merge_screenshot_photo():
    screen = take_screenshot()
    photo_path = "67.png" #take_photo()

    base_dir = os.path.dirname(os.path.dirname(__file__))  
    image_dir = os.path.join(base_dir, "images")
    os.makedirs(image_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"screen_{timestamp}.png"
    output_path = os.path.join(image_dir, filename)

    photo = Image.open(photo_path).convert("RGB")


    # resize a bit divide width by 2 adjusts height
    w, h = photo.size
    new_width = w//2
    new_height = int(screen.height * (new_width / screen.width))
    screen = screen.resize((new_width, new_height))

    # paste screenshot in bottom-right corner
    position = (w - new_width - 10, h - new_height - 10) 
    photo.paste(screen, position)

    # save result
    photo.save(output_path)
    
    return output_path


#main function 
def you_got_caught(site):
    print(f"You opened {site}")
    output = merge_screenshot_photo()
    print(f"merged image saved at {output}")
    #based on site maybe do different sound effects etc
    #takes output inputs into discord bot





