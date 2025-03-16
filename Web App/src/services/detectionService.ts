// Service to communicate with the Python backend

export interface ObjectDetection {
    class_id: number;
    class_name: string;
    confidence: number;
  }
  
  export interface DetectionResult {
    timestamp: number;
    objects: ObjectDetection[]; // Matches the backend response
  }
  
  export interface AlertResult {
    timestamp: number;
    alerts: {
      object: string; // Matches the backend response
      consecutive_count: number;
      last_detection: number;
    }[];
  }
  
  // Update this URL to match your Python backend location
  const API_URL = 'http://localhost:5000';
  
  // List of allowed animal classes
  const ALLOWED_ANIMALS = ['dog', 'cat', 'cow', 'elephant']; // Add more animals as needed
  
  export const getLatestDetections = async (): Promise<DetectionResult> => {
    try {
      const response = await fetch(`${API_URL}/api/detections`);
      if (!response.ok) {
        throw new Error(`Failed to fetch detections: ${response.statusText}`);
      }
      const data = await response.json();
  
      // Filter out non-animal objects
      const filteredObjects = data.objects.filter((obj: ObjectDetection) =>
        ALLOWED_ANIMALS.includes(obj.class_name.toLowerCase())
      );
  
      console.log('Filtered detection data:', { ...data, objects: filteredObjects });
      return { ...data, objects: filteredObjects };
    } catch (error) {
      console.error('Error fetching detection data:', error);
      return { timestamp: Date.now(), objects: [] }; // Return empty result on error
    }
  };
  
  export const getAlerts = async (): Promise<AlertResult> => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }
      const data = await response.json();
  
      // Filter alerts to only include allowed animals
      const filteredAlerts = data.alerts.filter((alert: { object: string }) =>
        ALLOWED_ANIMALS.includes(alert.object.toLowerCase())
      );
  
      console.log('Filtered alert data:', { ...data, alerts: filteredAlerts });
      return { ...data, alerts: filteredAlerts };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return { timestamp: Date.now(), alerts: [] }; // Return empty result on error
    }
  };