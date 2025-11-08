import os, datetime, pyautogui, platform
from PIL import Image
import discordbot
from dotenv import load_dotenv
from openai import OpenAI
import time
import funnysounds

cooldownTime = 10
volumeUpTime = 10
timeBetweenPresses = 0.1
lastTrigger = -30
def take_screenshot():
    screenshot = pyautogui.screenshot()
    return screenshot.convert("RGB")

#def get photo (call function to the yolo thingy cv.read() and just return it here )

#def take_photo():
    #blablabla

def merge_screenshot_photo():
    screen = take_screenshot()
    photo_path = os.path.join(os.path.dirname(__file__), "67.png") #take_photo()

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

def get_gpt_caption(output, reason):
    load_dotenv()
    api_key = os.getenv("OPENAI_KEY")
    client = OpenAI(api_key=api_key)
    prompt = f"""
    Write a short, funny, edgy not super appropriate for work roast-style caption for a 'caught slacking' photo.
    The photo is saved at: {output}. This is an app that tracks webcam and computer and "catches you slacking", if you pick your nose, open sites you should not be on like youtube.
    And it is being posted to discord and we need an extremely edgy dark funny caption that is completely stupid. The reason for this specific image is {reason}.
    Make it, witty, and meme-worthy. and not corny be blunt call this person out just absolute stupidness with the caption that can also make no sense. 
    Funny, edgy really dark as dark as you can go, just hilarious. 20 words max.
    """


    # send chat completion request
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # cheaper & fast
        messages=[
            {"role": "system", "content": "You are a sarcastic meme caption generator."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=80
    )

    caption = response.choices[0].message.content.strip()
    print("Caption:", caption)
    return caption

#main function 
def you_got_caught(reason):
    global lastTrigger
    now = time.time()
    if (now - lastTrigger >= cooldownTime):
        lastTrigger = now
        print(f"You opened {reason}")
        output = merge_screenshot_photo()
        print(f"merged image saved at {output}")
        funnysounds.play_alarm_and_funny()
        #caption = get_gpt_caption(output, reason)
        caption = "gpt disabled rn"
        discordbot.post_to_discord(reason, confidence=1, image_path=output, caption=caption)
        
        i = 0
        while (i < volumeUpTime):
            system = platform.system()
            if system == "Windows":
                pyautogui.press("volumeup")
                pyautogui.press("volumeup")
                pyautogui.press("volumeup")
                pyautogui.press("volumeup")
            elif system == "Darwin":
                os.system("osascript -e 'set volume output volume ((output volume of (get volume settings)) + 50)'")
    
            time.sleep(timeBetweenPresses)
            i += timeBetweenPresses
    #based on site maybe do different sound effects etc
    #takes output inputs into discord bot





