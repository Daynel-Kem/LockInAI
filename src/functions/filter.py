import cv2
import numpy as np
from pychubby.detect import LandmarkFace
from pychubby.actions import Chubbify, RaiseEyebrow, StretchNostrils
import os

def chubbify_and_overlay_eyes(image_path, eye_png_path, output_path):
    """
    Apply Chubbify, RaiseEyebrow, StretchNostrils to a face, 
    then overlay the same eye PNG on both eyes.

    Args:
        image_path (str): Path to input face image.
        eye_png_path (str): Path to single eye PNG with transparency.
        output_path (str): Path to save final image.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")
    if not os.path.exists(eye_png_path):
        raise FileNotFoundError(f"Eye PNG not found: {eye_png_path}")

    # --- Step 1: Load image and apply PyChubby modifications ---
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Failed to load image. Check file format: {image_path}")

    # Detect landmarks
    lf = LandmarkFace.estimate(image)

    # Apply Chubbify
    lf, _ = Chubbify().perform(lf)
    # Apply RaiseEyebrow
    lf, _ = RaiseEyebrow().perform(lf)
    # Apply StretchNostrils
    lf, _ = StretchNostrils().perform(lf)

    # Work with modified image
    base_img = lf.img.copy()

    # --- Step 2: Load eye PNG ---
    eye_img = cv2.imread(eye_png_path, cv2.IMREAD_UNCHANGED)
    if eye_img.shape[2] != 4:
        raise ValueError("Eye PNG must have an alpha channel (RGBA).")
    eye_rgb = eye_img[:, :, :3]
    eye_alpha = eye_img[:, :, 3] / 255.0  # normalize alpha

    # Detect landmarks again on modified image
    lf_mod = LandmarkFace.estimate(base_img)
    points = lf_mod.points

    # Left and right eyes (68-point model)
    left_eye = points[36:42]
    right_eye = points[42:48]

    # Helper function to overlay eye PNG
    def overlay_eye(target_eye):
        center_x = int(target_eye[:, 0].mean())
        center_y = int(target_eye[:, 1].mean())

        # Scale PNG to match eye width
        width = int(np.linalg.norm(target_eye[3] - target_eye[0]) * 1.7)
        scale = width / eye_rgb.shape[1]
        new_h = int(eye_rgb.shape[0] * scale)
        new_w = int(eye_rgb.shape[1] * scale)
        eye_resized = cv2.resize(eye_rgb, (new_w, new_h))
        alpha_resized = cv2.resize(eye_alpha, (new_w, new_h))

        x_offset = int(center_x - new_w / 2)
        y_offset = int(center_y - new_h / 2)

        # Boundaries
        x1, y1 = max(0, x_offset), max(0, y_offset)
        x2, y2 = min(base_img.shape[1], x_offset + new_w), min(base_img.shape[0], y_offset + new_h)

        # Crop resized eye if needed
        eye_crop = eye_resized[y1 - y_offset:y2 - y_offset, x1 - x_offset:x2 - x_offset]
        alpha_crop = alpha_resized[y1 - y_offset:y2 - y_offset, x1 - x_offset:x2 - x_offset]

        # Blend
        for c in range(3):
            base_img[y1:y2, x1:x2, c] = (alpha_crop * eye_crop[:, :, c] +
                                         (1 - alpha_crop) * base_img[y1:y2, x1:x2, c])

    # Overlay same eye on both eyes
    overlay_eye(left_eye)
    overlay_eye(right_eye)

    # Save final image
    cv2.imwrite(output_path, base_img)
    print(f"Saved final modified image to {output_path} ✅")


# --- Example usage ---
if __name__ == "__main__":
    input_face = "/Users/daynel/Documents/GitHub/GoonHacks/src/functions/image.jpg"
    eye_png = "/Users/daynel/Documents/GitHub/GoonHacks/src/functions/crying.png"
    output_file = "/Users/daynel/Documents/GitHub/GoonHacks/src/functions/final_face_with_eyes.jpg"

    chubbify_and_overlay_eyes(input_face, eye_png, output_file)
