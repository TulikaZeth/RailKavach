'use client';

import { useEffect, useState } from 'react';
import { getLatestDetections, getAlerts, AnimalDetection, AlertResult } from '@/services/detectionService';

export default function AnimalDetector() {
  const [detections, setDetections] = useState<AnimalDetection[]>([]);
  const [alerts, setAlerts] = useState<AlertResult['alerts']>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch latest detections
  const fetchDetections = async () => {
    try {
      const detectionData = await getLatestDetections();
      if (detectionData.objects.length > 0) {
        setDetections(detectionData.objects); // Use `objects` instead of `animals`
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