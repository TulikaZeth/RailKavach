import torch
import numpy as np
import cv2
from ultralytics import YOLO
import time
import json
from flask import Flask, Response, jsonify
import threading
import queue
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Queue to store detection results
detection_queue = queue.Queue(maxsize=10)
# Track consecutive detections
object_tracking = {}
# List to store all alerts
all_alerts = []

class ObjectDetection:
    def __init__(self, capture_index):
        self.capture_index = capture_index
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("Using Device: " + self.device)
        
        self.model = self.load_model()
        self.CLASS_NAMES_DICT = self.model.model.names
        
    def load_model(self):
        model = YOLO('yolov8m.pt')
        model.fuse()
        return model
        
    def predict(self, frame):
        results = self.model(frame)
        return results
    
    def check_for_objects(self, results):
        # Get class IDs from results
        if not results or len(results) == 0:
            return []
        
        boxes = results[0].boxes
        class_ids = boxes.cls.cpu().numpy().astype(int)
        confidences = boxes.conf.cpu().numpy()
        
        # Return all detected objects with confidence > 0.5
        objects_detected = []
        for class_id, confidence in zip(class_ids, confidences):
            if confidence > 0.5:  # Filter by confidence threshold
                objects_detected.append({
                    "class_id": int(class_id),
                    "class_name": self.CLASS_NAMES_DICT[class_id],
                    "confidence": float(confidence)
                })
        
        return objects_detected
    
    def run_detection(self):
        cap = cv2.VideoCapture(1)
        assert cap.isOpened(), "Error: Could not open video capture"
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        last_check_time = time.time()
        check_interval = 30  # Check every 30 seconds
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Error: Failed to read frame")
                    break
                
                current_time = time.time()
                # Only run detection every 30 seconds
                if current_time - last_check_time >= check_interval:
                    results = self.predict(frame)
                    objects = self.check_for_objects(results)
                    
                    # Put results in queue for API access
                    if not detection_queue.full():
                        detection_queue.put({
                            "timestamp": current_time,
                            "objects": objects
                        })
                    
                    # Update tracking data for consecutive detections
                    update_object_tracking(objects)
                    
                    last_check_time = current_time
                
                # Small delay to prevent CPU overuse
                time.sleep(0.1)
                
        finally:
            cap.release()

def update_object_tracking(objects):
    """Track consecutive object detections"""
    global object_tracking, all_alerts
    
    current_time = time.time()
    objects_found = set()
    
    # Record current objects
    for obj in objects:
        object_name = obj["class_name"]
        objects_found.add(object_name)
        
        if object_name in object_tracking:
            # Object was already detected before
            prev_time = object_tracking[object_name]["last_detection"]
            count = object_tracking[object_name]["consecutive_count"]
            
            # If detected within ~60 seconds of last detection, count as consecutive
            if current_time - prev_time < 60:
                object_tracking[object_name] = {
                    "last_detection": current_time,
                    "consecutive_count": count + 1
                }
                
                # Alert on second consecutive detection
                if count == 1:
                    alert = {
                        "object": object_name,
                        "consecutive_count": count + 1,
                        "last_detection": current_time
                    }
                    all_alerts.append(alert)
                    print(f"ALERT: {object_name} detected in consecutive checks!")
                    
                    # Clear alerts for this object after two consecutive detections
                    if count + 1 == 2:
                        all_alerts = [alert for alert in all_alerts if alert["object"] != object_name]
                        print(f"Cleared alerts for {object_name}")
            else:
                # Reset if too much time passed
                object_tracking[object_name] = {
                    "last_detection": current_time,
                    "consecutive_count": 1
                }
        else:
            # First time detection
            object_tracking[object_name] = {
                "last_detection": current_time,
                "consecutive_count": 1
            }
            print(f"Object detected: {object_name}")
    
    # Expire old detections
    expired_objects = []
    for object_name in object_tracking:
        if current_time - object_tracking[object_name]["last_detection"] > 120:  # 2 minutes expiry
            expired_objects.append(object_name)
    
    for object_name in expired_objects:
        del object_tracking[object_name]

@app.route('/api/detections', methods=['GET'])
def get_detections():
    """Return the latest detection results"""
    if not detection_queue.empty():
        latest = detection_queue.get()
        return jsonify(latest)
    else:
        return jsonify({"timestamp": time.time(), "objects": []})

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Return all alerts"""
    return jsonify({
        "timestamp": time.time(),
        "alerts": all_alerts
    })

if __name__ == "__main__":
    # Start detection in a separate thread
    detector = ObjectDetection(capture_index=0)
    detection_thread = threading.Thread(target=detector.run_detection)
    detection_thread.daemon = True
    detection_thread.start()
    
    # Run Flask server
    app.run(host='0.0.0.0', port=5000)