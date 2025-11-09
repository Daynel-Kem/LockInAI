import requests
import random
import database

# Discord webhook URL for sending detection alerts
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1436744629197213817/_8njr0_0AjymTAvXMzup7pUF0eKFVxR-jJJgG2oN9XDKvLmif29RJ-XADMYr_Xc4k8_8"


def _build_detection_message(event_type, username=None, confidence=None, caption=None):
    """
    Builds a formatted message for Discord notification.

    Args:
        event_type: The type of event detected (e.g., 'yawn', 'nose_picking')
        username: The username of the person caught (optional)
        confidence: Detection confidence between 0.0-1.0 (optional)
        caption: Additional AI-generated caption (optional)

    Returns:
        str: Formatted message string
    """
    # Format the event type: replace underscores with spaces and capitalize
    formatted_event = event_type.replace('_', ' ').title()

    # Include username if provided
    if username and username != "Anonymous":
        message = f"**{username}** caught doing: **{formatted_event}**"
    else:
        message = f"Detected **{formatted_event}**"

    # Add confidence percentage if available
    if confidence is not None:
        confidence_percentage = confidence * 100
        message += f" with {confidence_percentage:.1f}% confidence."
    else:
        message += "!"

    # Append AI-generated caption if provided
    if caption:
        message += f"\n{caption}"

    return message


def post_to_discord(event_type, username="Anonymous", confidence=None, image_path=None, caption=None):
    """
    Sends a detection event to Discord using a webhook and logs it to the database.

    Args:
        event_type: The type of event detected (e.g., 'yawn', 'nose_picking')
        username: The username of the person caught
        confidence: Detection confidence between 0.0-1.0 (optional)
        image_path: Path to an image file to attach (optional)
        caption: Additional AI-generated caption (optional)

    Returns:
        bool: True if message was sent successfully, False otherwise
    """
    # Log detection to database first
    try:
        database.log_detection(
            username=username,
            event_type=event_type,
            confidence=confidence,
            image_path=image_path,
            caption=caption
        )
    except Exception as e:
        print(f"✗ Failed to log detection to database: {e}")

    # Build the notification message
    message = _build_detection_message(event_type, username, confidence, caption)
    data = {"content": message}

    # Send request with or without image attachment
    try:
        if image_path:
            with open(image_path, "rb") as img:
                files = {"file": img}
                response = requests.post(DISCORD_WEBHOOK_URL, data=data, files=files)
        else:
            response = requests.post(DISCORD_WEBHOOK_URL, json=data)

        # Check if the request was successful
        if response.status_code in (200, 204):
            print(f"✓ Sent: {message}")
            return True
        else:
            print(f"✗ Discord API error: {response.status_code} - {response.text}")
            return False

    except FileNotFoundError:
        print(f"✗ Error: Image file not found at {image_path}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Network error: {e}")
        return False






