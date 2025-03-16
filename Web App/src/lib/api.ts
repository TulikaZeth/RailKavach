import axios from 'axios';
import { Train, Camera, Station, DetectionEvent, Alert } from '@/types';

// Create an axios instance with base URL and default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Fetch dummy data (renamed to keep the original function name but now uses real API)
export const fetchDummyData = async () => {
  try {
    // Fetch all required data in parallel
    const [stations, cameras, trains, events, alerts] = await Promise.all([
      api.get('/stations'),
      api.get('/cameras'),
      api.get('/trains'),
      api.get('/events', { params: { limit: 8 } }),
      api.get('/alerts', { params: { limit: 8 } })
    ]);

    // Filter out resolved alerts
    const unresolvedAlerts = alerts.data.alerts ? 
      alerts.data.alerts.filter((alert: Alert) => alert.status !== 'resolved') :
      alerts.data.filter((alert: Alert) => alert.status !== 'resolved');

    return {
      stations: stations.data,
      cameras: cameras.data,
      trains: trains.data,
      events: events.data.events || events.data, // Handle both formats
      alerts: unresolvedAlerts
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Fetch train location - keeping the original function name
export const fetchTrainLocation = async (trainId: string) => {
  try {
    const response = await api.get(`/trains/${trainId}/location`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching location for train ${trainId}:`, error);
    throw error;
  }
};

// Calculate distance - keeping the original function name
export const calculateDistance = async (trainId: string, cameraId: string) => {
  try {
    const response = await api.get(`/distance`, {
      params: { trainId, cameraId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error calculating distance between train ${trainId} and camera ${cameraId}:`, error);
    throw error;
  }
};

// Additional helper functions that can be used if needed

// Get real-time updates for a train
export const subscribeToTrainUpdates = async (trainId: string, callback: (data: any) => void) => {
  try {
    // This would typically use WebSockets in a real application
    // For this example, we'll use polling with axios
    
    const intervalId = setInterval(async () => {
      try {
        const response = await api.get(`/trains/${trainId}`);
        callback(response.data);
      } catch (err) {
        console.error(`Error polling train ${trainId} updates:`, err);
      }
    }, 5000); // Poll every 5 seconds
    
    // Return a function to unsubscribe
    return () => clearInterval(intervalId);
  } catch (error) {
    console.error(`Error setting up train ${trainId} subscription:`, error);
    throw error;
  }
};

// Report a false positive detection
export const reportFalsePositive = async (eventId: string, notes?: string) => {
  try {
    const response = await api.post(`/events/${eventId}/false-positive`, { notes });
    return response.data;
  } catch (error) {
    console.error(`Error reporting false positive for event ${eventId}:`, error);
    throw error;
  }
};

// Acknowledge an alert
export const acknowledgeAlert = async (alertId: string, userId: string, userName: string) => {
  try {
    const response = await api.post(`/alerts/${alertId}/acknowledge`, {
      acknowledgedBy: {
        userId,
        userName,
        timestamp: new Date().toISOString()
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error acknowledging alert ${alertId}:`, error);
    throw error;
  }
};

// Resolve an alert
export const resolveAlert = async (alertId: string, notes?: string) => {
  try {
    const response = await api.post(`/alerts/${alertId}/resolve`, {
      resolvedAt: new Date().toISOString(),
      notes
    });
    return response.data;
  } catch (error) {
    console.error(`Error resolving alert ${alertId}:`, error);
    throw error;
  }
};