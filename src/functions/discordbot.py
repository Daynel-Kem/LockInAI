import requests

def post_to_discord(event_type, confidence=None, image_path=None):
    """
    Sends a detection event to Discord using a webhook.
    event_type: what was detected (e.g., 'yawn', 'nose_picking')
    confidence: detection confidence 0.0-1.0 (optional)
    image_path: path to image file (optional)
    """
    WEBHOOK_URL = "https://discord.com/api/webhooks/1436744629197213817/_8njr0_0AjymTAvXMzup7pUF0eKFVxR-jJJgG2oN9XDKvLmif29RJ-XADMYr_Xc4k8_8"
    
    # Create message - replace underscores with spaces and capitalize
    message = f" Detected **{event_type.replace('_', ' ').title()}**"
    
    # Add confidence if provided
    if confidence:
        message += f" with {confidence * 100:.1f}% confidence."
    else:
        message += "!"
    
    # Package message for Discord
    data = {"content": message}
    
    # Send with or without image
    if image_path:
        with open(image_path, "rb") as img:
            files = {"file": img}
            response = requests.post(WEBHOOK_URL, data=data, files=files)
    else:
        response = requests.post(WEBHOOK_URL, json=data)
    
    # Check if successful
    if response.status_code == 204 or response.status_code == 200:
        print(f"✅ Sent: {message}")
    else:
        print(f"⚠️ Error: {response.status_code} - {response.text}")


post_to_discord("yawn")
post_to_discord("nose_picking", confidence=0.85)


