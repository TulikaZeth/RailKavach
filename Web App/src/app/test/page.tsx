'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';

interface DetectionObject {
  class_id: number;
  class_name: string;
  confidence: number;
}

interface DetectionResult {
  timestamp: number;
  objects: DetectionObject[];
}

interface Alert {
  object: string;
  consecutive_count: number;
  last_detection: number;
  image_path: string;
}

export default function DetectionPage() {
  const [detections, setDetections] = useState<DetectionResult | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch detections
        const detectionsRes = await fetch('http://localhost:5000/api/detections');
        const detectionsData = await detectionsRes.json();
        setDetections(detectionsData);

        // Fetch alerts
        const alertsRes = await fetch('http://localhost:5000/api/alerts');
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Object Detection Monitor</title>
        <meta name="description" content="Real-time object detection monitoring" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Object Detection Monitor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Detections */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-400 border-b border-gray-700 pb-2">
              Current Detections
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : detections ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Last updated: {formatTime(detections.timestamp)}
                </p>
                {detections.objects.length > 0 ? (
                  <ul className="space-y-3">
                    {detections.objects.map((obj, index) => (
                      <li key={index} className="bg-gray-700 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{obj.class_name}</span>
                          <span className="text-yellow-400">
                            {(obj.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">No objects detected</p>
                )}
              </div>
            ) : (
              <p className="text-red-400">Failed to load detection data</p>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-400 border-b border-gray-700 pb-2">
              Alerts
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : alerts.length > 0 ? (
              <ul className="space-y-4">
                {alerts.map((alert, index) => (
                  <li key={index} className="bg-gray-700 p-4 rounded-md border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{alert.object}</h3>
                        <p className="text-gray-400">
                          Detected {alert.consecutive_count} times consecutively
                        </p>
                        <p className="text-gray-400 text-sm">
                          Last detected: {formatTime(alert.last_detection)}
                        </p>
                      </div>
                    </div>
                    {alert.image_path && (
                      <div className="mt-3">
                        <img
                          src={`http://localhost:5000/api/images/${alert.image_path}`}
                          alt={`Detected ${alert.object}`}
                          className="rounded-md max-w-full h-auto border border-gray-600"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No active alerts</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}