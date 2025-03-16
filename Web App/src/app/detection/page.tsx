'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { getLatestDetections, getAlerts, AnimalDetection, AlertResult } from '@/services/detectionService';

export default function AnimalDetector() {
  const [detections, setDetections] = useState<AnimalDetection[]>([]);
  const [alerts, setAlerts] = useState<AlertResult['alerts']>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to create a detection event
  const createDetectionEvent = async (animal: AnimalDetection) => {
    try {
      const detectionData = {
        camera: '67d46885230a07d3aee44fe3', // Replace with actual camera ID
        animalType: animal.class_name,
        confidence: animal.confidence,
        imageUrl: 'some-image-url', // Replace with actual image URL if available
        status: 'detected',
      };

      console.log(detectionData)

      const response = await axios.post('/api/detections', detectionData);
      console.log('Detection event created:', response.data);
      return response.data._id; // Return the ID of the created detection event
    } catch (err) {
      console.error('Error creating detection event:', err);
      throw err;
    }
  };

  // Function to create an alert
  const createAlert = async (detectionId: string, animal: AnimalDetection) => {
    try {
      const alertData = {
        eventId: detectionId, // Use the detection event ID
        camera: '67d46885230a07d3aee44fe3', // Replace with actual camera ID
        alertType: 'animal_detected',
        alertSeverity: 'high',
        status: 'active',
        affectedTrains: ["67d3421c5a29d6d2dc984465"], // Add affected trains if applicable
        notifiedStations: ["67d3417a5a29d6d2dc98445f"], // Add notified stations if applicable
        notes: `Animal detected: ${animal.class_name} with confidence ${(animal.confidence * 100).toFixed(1)}%`,
      };

      const response = await axios.post('/api/alerts', alertData);
      console.log('Alert created:', response.data);
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  // Fetch latest detections
  const fetchDetections = async () => {
    try {
      const detectionData = await getLatestDetections();
      if (detectionData.objects.length > 0) {
        setDetections(detectionData.objects);

        // Create detection events and alerts for new detections
        for (const animal of detectionData.objects) {
          try {
            const detectionId = await createDetectionEvent(animal);
            await createAlert(detectionId, animal);
          } catch (err) {
            console.error('Error processing detection:', err);
          }
        }
      } else {
        setDetections([]); // Clear detections if no animals are detected
      }
    } catch (err) {
      console.error('Error fetching detections:', err);
      throw new Error('Failed to fetch detections');
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const alertData = await getAlerts();
      if (alertData.alerts.length > 0) {
        setAlerts(alertData.alerts);
      } else {
        setAlerts([]); // Clear alerts if no consecutive detections
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
      throw new Error('Failed to fetch alerts');
    }
  };

  // Check for animals and alerts
  const checkForAnimals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([fetchDetections(), fetchAlerts()]);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkForAnimals();

    // Set up polling interval
    const intervalId = setInterval(checkForAnimals, 30000); // Check every 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Animal Detection System</h2>
      
      {/* Error Message */}
      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-4 text-gray-500">
          Loading...
        </div>
      )}

      {/* Latest Detections */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Latest Detections</h3>
        {detections.length > 0 ? (
          <ul className="list-disc pl-5">
            {detections.map((animal, index) => (
              <li key={index} className="mb-1">
                {animal.class_name} (Confidence: {(animal.confidence * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No animals detected in the last scan</p>
        )}
      </div>
      
      {/* Active Alerts */}
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Active Alerts</h3>
        {alerts.length > 0 ? (
          <ul className="list-disc pl-5">
            {alerts.map((alert, index) => (
              <li key={index} className="mb-1 text-red-600 font-medium">
                {alert.object} - Detected {alert.consecutive_count} consecutive times
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No consecutive detections</p>
        )}
      </div>
      
      {/* Last Updated Time */}
      {lastUpdated && (
        <p className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}