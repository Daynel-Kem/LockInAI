import cv2
import numpy as np
from ultralytics import YOLO

BEHAVIOR_MODEL_PATH = "behavior_detection_yolov8m.pt"
CONFIDENCE_THRESHOLD = 0.6

CLASS_NAMES = {0: "mouth_open", 1: "mouth_closed", 2: "face"}

COLORS = {
    0: (0, 255, 255),  # Yellow - mouth_open
    1: (0, 255, 0),  # Green - mouth_closed
    2: (255, 0, 0),  # Blue - face
}


def main():
    print("Loading model...")
    model = YOLO(BEHAVIOR_MODEL_PATH)

    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Cannot access camera")
        return

    print("Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run detection
        results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)[0]

        # Process detections - draw bounding boxes only
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            # Draw bounding box
            color = COLORS.get(cls, (255, 255, 255))
            thickness = 3 if cls == 0 else 2
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

            # Draw label
            label = f"{CLASS_NAMES[cls]}: {conf:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]

            # Background for label
            cv2.rectangle(
                frame,
                (x1, y1 - label_size[1] - 10),
                (x1 + label_size[0], y1),
                color,
                -1,
            )
            cv2.putText(
                frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2
            )

        cv2.imshow("Behavior Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
