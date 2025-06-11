import torch
import numpy as np
import cv2
from ultralytics import YOLO
import time
import json
from flask import Flask, Response, jsonify, request
import threading
import queue
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://rail-web.vercel.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Queue to store detection results
detection_queue = queue.Queue(maxsize=10)
# Track consecutive detections
object_tracking = {}
# List to store all alerts
all_alerts = []

class ObjectDetection:
    def __init__(self):
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
        
        ignore_classes = ['laptop', 'tv', 'person', 'cell phone']
        # Return all detected objects with confidence > 0.5
        objects_detected = []
        for class_id, confidence in zip(class_ids, confidences):
            class_name = self.CLASS_NAMES_DICT[class_id]
            if confidence > 0.5 and class_name.lower() not in ignore_classes:  # Filter by confidence threshold
                objects_detected.append({
                    "class_id": int(class_id),
                    "class_name": class_name,
                    "confidence": float(confidence)
                })
        
        return objects_detected
    
    def process_frame(self, frame_data):
        """Process a frame received from the client"""
        try:
            # Convert base64 to numpy array
            img_data = base64.b64decode(frame_data.split(',')[1])
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            if img is None:
                return []
            
            # Run detection
            results = self.predict(img)
            return self.check_for_objects(results)
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return []

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

@app.route('/api/detect', methods=['GET', 'POST', 'OPTIONS'])
def handle_detections():
    """Handle both GET and POST requests for detections"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        return response
    
    if request.method == 'POST':
        # Process frame from client
        data = request.json
        frame = data.get('frame')
        
        if not frame:
            return jsonify({"error": "No frame provided"}), 400
        
        objects = detector.process_frame(frame)
        update_object_tracking(objects)
        
        # Store in queue
        if not detection_queue.full():
            detection_queue.put({
                "timestamp": time.time(),
                "objects": objects
            })
        
        response = jsonify({
            "timestamp": time.time(),
            "objects": objects
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    
    else:  # GET request
        if not detection_queue.empty():
            latest = detection_queue.get()
            response = jsonify(latest)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({"timestamp": time.time(), "objects": []})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

@app.route('/api/alerts', methods=['GET', 'OPTIONS'])
def get_alerts():
    """Return all alerts"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    response = jsonify({
        "timestamp": time.time(),
        "alerts": all_alerts
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

# Initialize the detector
detector = ObjectDetection()

if __name__ == "__main__":
    # Run Flask server
    app.run(host='0.0.0.0', port=5000)