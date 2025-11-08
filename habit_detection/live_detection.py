import cv2
import numpy as np
from ultralytics import YOLO
from collections import deque
import time


class HabitDetector:
    def __init__(self, model_path='yolo_detection_model.pt', iou_threshold=0.3, confidence_threshold=0.5):
        self.model = YOLO(model_path)
        self.iou_threshold = iou_threshold
        self.confidence_threshold = confidence_threshold
        
        self.class_names = {0: 'yawn', 1: 'nose', 2: 'mouth', 3: 'finger'}
        self.colors = {
            0: (0, 255, 255),    # Yellow for yawn
            1: (255, 0, 0),      # Blue for nose
            2: (0, 255, 0),      # Green for mouth
            3: (255, 0, 255)     # Magenta for finger
        }
        
        self.habit_colors = {
            'yawning': (0, 255, 255),
            'nose_picking': (0, 0, 255),
            'finger_biting': (255, 165, 0)
        }
        
        self.yawning_history = deque(maxlen=5)
        self.nose_picking_history = deque(maxlen=5)
        self.finger_biting_history = deque(maxlen=5)
        
    def calculate_iou(self, box1, box2):
        x1_min, y1_min, x1_max, y1_max = box1
        x2_min, y2_min, x2_max, y2_max = box2
        
        inter_x_min = max(x1_min, x2_min)
        inter_y_min = max(y1_min, y2_min)
        inter_x_max = min(x1_max, x2_max)
        inter_y_max = min(y1_max, y2_max)
        
        if inter_x_max < inter_x_min or inter_y_max < inter_y_min:
            return 0.0
        
        inter_area = (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min)
        box1_area = (x1_max - x1_min) * (y1_max - y1_min)
        box2_area = (x2_max - x2_min) * (y2_max - y2_min)
        union_area = box1_area + box2_area - inter_area
        
        return inter_area / union_area if union_area > 0 else 0.0
    
    def detect_habits(self, detections):
        boxes_by_class = {0: [], 1: [], 2: [], 3: []}
        
        for detection in detections:
            class_id = int(detection['class'])
            confidence = detection['confidence']
            box = detection['box']
            
            if confidence >= self.confidence_threshold:
                boxes_by_class[class_id].append(box)
        
        yawning = len(boxes_by_class[0]) > 0
        nose_picking = False
        finger_biting = False
        
        for finger_box in boxes_by_class[3]:
            for nose_box in boxes_by_class[1]:
                iou = self.calculate_iou(finger_box, nose_box)
                if iou > self.iou_threshold:
                    nose_picking = True
                    break
            
            for mouth_box in boxes_by_class[2]:
                iou = self.calculate_iou(finger_box, mouth_box)
                if iou > self.iou_threshold:
                    finger_biting = True
                    break
        
        self.yawning_history.append(yawning)
        self.nose_picking_history.append(nose_picking)
        self.finger_biting_history.append(finger_biting)
        
        return yawning, nose_picking, finger_biting
    
    def is_yawning(self):
        if len(self.yawning_history) < 3:
            return False
        return sum(self.yawning_history) >= 2
    
    def is_nose_picking(self):
        if len(self.nose_picking_history) < 3:
            return False
        return sum(self.nose_picking_history) >= 2
    
    def is_finger_biting(self):
        if len(self.finger_biting_history) < 3:
            return False
        return sum(self.finger_biting_history) >= 2
    
    def draw_detection(self, frame, box, class_id, confidence):
        x1, y1, x2, y2 = map(int, box)
        color = self.colors.get(class_id, (255, 255, 255))
        label = self.class_names.get(class_id, 'unknown')
        
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        
        text = f"{label}: {confidence:.2f}"
        (text_width, text_height), baseline = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x1, y1 - text_height - 5), (x1 + text_width, y1), color, -1)
        cv2.putText(frame, text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    
    def draw_habit_banner(self, frame, habits):
        height, width = frame.shape[:2]
        banner_height = 80
        y_offset = 10
        
        if habits['yawning']:
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         self.habit_colors['yawning'], -1)
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         (0, 0, 0), 3)
            cv2.putText(frame, "YAWNING DETECTED", (20, y_offset + 50), 
                       cv2.FONT_HERSHEY_BOLD, 1.5, (0, 0, 0), 3)
            y_offset += banner_height + 10
        
        if habits['nose_picking']:
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         self.habit_colors['nose_picking'], -1)
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         (0, 0, 0), 3)
            cv2.putText(frame, "NOSE PICKING DETECTED", (20, y_offset + 50), 
                       cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 3)
            y_offset += banner_height + 10
        
        if habits['finger_biting']:
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         self.habit_colors['finger_biting'], -1)
            cv2.rectangle(frame, (10, y_offset), (width - 10, y_offset + banner_height), 
                         (0, 0, 0), 3)
            cv2.putText(frame, "FINGER BITING DETECTED", (20, y_offset + 50), 
                       cv2.FONT_HERSHEY_BOLD, 1.5, (255, 255, 255), 3)
    
    def process_frame(self, frame):
        results = self.model.predict(frame, conf=self.confidence_threshold, verbose=False)
        
        detections = []
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for i in range(len(boxes)):
                box = boxes.xyxy[i].cpu().numpy()
                confidence = float(boxes.conf[i].cpu().numpy())
                class_id = int(boxes.cls[i].cpu().numpy())
                
                detections.append({
                    'box': box,
                    'confidence': confidence,
                    'class': class_id
                })
                
                self.draw_detection(frame, box, class_id, confidence)
        
        yawning, nose_picking, finger_biting = self.detect_habits(detections)
        
        habits = {
            'yawning': self.is_yawning(),
            'nose_picking': self.is_nose_picking(),
            'finger_biting': self.is_finger_biting()
        }
        
        self.draw_habit_banner(frame, habits)
        
        status_y = frame.shape[0] - 100
        cv2.rectangle(frame, (0, status_y), (300, frame.shape[0]), (50, 50, 50), -1)
        cv2.putText(frame, "Status:", (10, status_y + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"Yawning: {habits['yawning']}", (10, status_y + 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        cv2.putText(frame, f"Nose Picking: {habits['nose_picking']}", (10, status_y + 70), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
        cv2.putText(frame, f"Finger Biting: {habits['finger_biting']}", (10, status_y + 90), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 165, 0), 1)
        
        return frame, habits


def main():
    model_path = 'yolo_detection_model.pt'
    detector = HabitDetector(model_path=model_path, iou_threshold=0.3, confidence_threshold=0.5)
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open camera")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    print("Starting live detection...")
    print("Press 'q' to quit")
    print("\nBoolean Functions Available:")
    print("- detector.is_yawning()")
    print("- detector.is_nose_picking()")
    print("- detector.is_finger_biting()")
    
    fps_time = time.time()
    fps_counter = 0
    fps_display = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame")
            break
        
        frame, habits = detector.process_frame(frame)
        
        fps_counter += 1
        if time.time() - fps_time > 1:
            fps_display = fps_counter
            fps_counter = 0
            fps_time = time.time()
        
        cv2.putText(frame, f"FPS: {fps_display}", (frame.shape[1] - 150, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        cv2.imshow('Habit Detection', frame)
        
        if habits['yawning']:
            print(f"[{time.strftime('%H:%M:%S')}] Yawning detected!")
        if habits['nose_picking']:
            print(f"[{time.strftime('%H:%M:%S')}] Nose picking detected!")
        if habits['finger_biting']:
            print(f"[{time.strftime('%H:%M:%S')}] Finger biting detected!")
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    print("\nDetection stopped")


if __name__ == "__main__":
    main()
