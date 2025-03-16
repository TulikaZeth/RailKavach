// app/station/[stationId]/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';

interface Camera {
  _id: string;
  cameraId: string;
  location: {
    type: string;
    coordinates: number[];
  };
  railwaySection: string;
  status: string;
  nearestStation: string;
}

interface Alert {
  _id: string;
  eventId: {
    _id: string;
    animalType: string;
    confidence: number;
    imageUrl: string;
  };
  camera: {
    _id: string;
    cameraId: string;
    railwaySection: string;
  };
  alertType: string;
  alertSeverity: string;
  status: string;
  createdAt: string;
  notifiedStations: any[];
}

interface Station {
  _id: string;
  stationCode: string;
  stationName: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

export default function StationDashboard() {
  const params = useParams();
  const stationId = params.stationId as string;
  
  const [station, setStation] = useState<Station | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<Alert[]>([]);
  const [nearbyCameras, setNearbyCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        setLoading(true);
        
        // Fetch station details
        const stationResponse = await axios.get(`/api/stations/${stationId}`);
        setStation(stationResponse.data);
        
        // Fetch all alerts
        const alertsResponse = await axios.get('/api/alerts');
        
        // Filter alerts for those that have this station in notifiedStations
        const relevantAlerts = alertsResponse.data.filter(
          (alert: Alert) => alert.notifiedStations.some((s: any) => s._id === stationId) && alert.status === 'active'
        );
        
        setNearbyAlerts(relevantAlerts);
        
        // Fetch cameras near this station
        // This is a simplified approach - ideally we'd have an API endpoint to get cameras by proximity
        const camerasResponse = await axios.get('/api/cameras');
        console.log(camerasResponse)
        const stationCameras = camerasResponse.data.filter(
          (camera: Camera) => camera.nearestStation._id.toString() === stationId
        );
        
        setNearbyCameras(stationCameras);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStationData();
  }, [stationId]);

  const resolveAlert = async (alertId: string) => {
    try {
      await axios.put(`/api/alerts/${alertId}`, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        acknowledgedBy: {
          userId: 'station-user',
          userName: 'Station Personnel',
          timestamp: new Date().toISOString()
        }
      });
      
      // Update the local state
      setNearbyAlerts(prevAlerts => 
        prevAlerts.filter(alert => alert._id !== alertId)
      );
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl font-semibold text-gray-300">Loading station dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-blue-900 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">
          {station?.stationName} ({station?.stationCode}) Dashboard
        </h1>
      </header>
      
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts Section */}
          <section className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              Active Alerts ({nearbyAlerts.length})
            </h2>
            
            {nearbyAlerts.length === 0 ? (
              <p className="text-gray-400">No active alerts at this time.</p>
            ) : (
              <div className="space-y-4">
                {nearbyAlerts.map((alert) => (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.alertSeverity === 'critical' ? 'bg-red-900 border-red-700' :
                      alert.alertSeverity === 'high' ? 'bg-orange-900 border-orange-700' :
                      alert.alertSeverity === 'medium' ? 'bg-yellow-900 border-yellow-700' :
                      'bg-blue-900 border-blue-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">
                          {alert.alertType.replace('_', ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-300">
                          Camera: {alert.camera?.cameraId} ({alert.camera?.railwaySection})
                        </p>
                        <p className="text-sm text-gray-300">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                        {alert.eventId.animalType && (
                          <p className="text-sm text-gray-200">
                            Animal detected: {alert.eventId.animalType.replace('_', ' ')} 
                            ({alert.eventId.confidence}% confidence)
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => resolveAlert(alert._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Resolve
                      </button>
                    </div>
                    
                    {alert.eventId.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={alert.eventId.imageUrl} 
                          alt="Detection image" 
                          className="h-40 w-full object-cover rounded"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>
          
          {/* Cameras Section */}
          <section className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              Nearby Cameras ({nearbyCameras.length})
            </h2>
            
            {nearbyCameras.length === 0 ? (
              <p className="text-gray-400">No cameras found near this station.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyCameras.map((camera) => (
                  <motion.div
                    key={camera._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-700 p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">{camera.cameraId}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        camera.status === 'active' ? 'bg-green-800 text-green-200' :
                        camera.status === 'inactive' ? 'bg-red-800 text-red-200' :
                        'bg-yellow-800 text-yellow-200'
                      }`}>
                        {camera.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">
                      Section: {camera.railwaySection}
                    </p>
                    <p className="text-sm text-gray-300">
                      Coordinates: {camera.location.coordinates.join(', ')}
                    </p>
                    <button
                      className="mt-2 w-full px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      onClick={() => window.open(`/cameras/${camera._id}/feed`, '_blank')}
                    >
                      View Feed
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}