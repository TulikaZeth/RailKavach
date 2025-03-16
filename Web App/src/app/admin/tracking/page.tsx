// src/app/admin/tracking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TrackingStatus {
  isRunning: boolean;
  environment: string;
  startedAt: string | null;
  nextUpdateIn: string | null;
}

interface TrainStatus {
  _id: string;
  trainNumber: string;
  trainName: string;
  currentLocation: {
    coordinates: [number, number];
    updatedAt: string;
  };
  currentSpeed: number;
  status: string;
}

export default function TrackingStatusPage() {
  const [status, setStatus] = useState<TrackingStatus | null>(null);
  const [trains, setTrains] = useState<TrainStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated (example)
    
    
    
    fetchData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [router]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tracking status
      const statusResponse = await fetch('/api/admin/tracking-status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      } else {
        throw new Error('Failed to fetch tracking status');
      }
      
      // Fetch trains
      const trainsResponse = await fetch('/api/admin/trains');
      if (trainsResponse.ok) {
        const trainsData = await trainsResponse.json();
        setTrains(trainsData);
      } else {
        throw new Error('Failed to fetch trains');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualUpdate = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/initialize-tracking', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger manual update');
      }
      
      const data = await response.json();
      alert(data.message || 'Update triggered successfully');
      
      // Save valid API key
      localStorage.setItem('adminApiKey', apiKey);
      
      // Refresh data after update
      setTimeout(fetchData, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTrain = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const trainNumber = formData.get('trainNumber')?.toString();
    
    if (!trainNumber) {
      setError('Train number is required');
      return;
    }
    
    if (!apiKey) {
      setError('API key is required');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/initialize-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          trainNumbers: [trainNumber]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add train');
      }
      
      const data = await response.json();
      alert(data.message || 'Train added successfully');
      
      // Save valid API key
      localStorage.setItem('adminApiKey', apiKey);
      
      // Refresh data after add
      setTimeout(fetchData, 3000);
      
      // Reset form
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Train Tracking System Status</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          {loading && !status ? (
            <p>Loading status...</p>
          ) : status ? (
            <div>
              <p className="mb-2">
                <span className="font-medium">Running:</span>{' '}
                <span className={status.isRunning ? 'text-green-600' : 'text-red-600'}>
                  {status.isRunning ? 'Yes' : 'No'}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-medium">Environment:</span> {status.environment}
              </p>
              {status.startedAt && (
                <p className="mb-2">
                  <span className="font-medium">Started:</span> {new Date(status.startedAt).toLocaleString()}
                </p>
              )}
              {status.nextUpdateIn && (
                <p className="mb-2">
                  <span className="font-medium">Next update in:</span> {status.nextUpdateIn}
                </p>
              )}
            </div>
          ) : (
            <p>No status available</p>
          )}
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Manual Update</h3>
            <div className="flex items-end gap-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium mb-1">Admin API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter API key"
                />
              </div>
              <button
                onClick={handleManualUpdate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Updating...' : 'Update Now'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Add Train</h2>
          <form onSubmit={handleAddTrain}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Train Number</label>
              <input
                type="text"
                name="trainNumber"
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g., 12051"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Admin API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter API key"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Train'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Tracked Trains</h2>
        {loading && trains.length === 0 ? (
          <p>Loading trains...</p>
        ) : trains.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Train Number</th>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Current Location</th>
                  <th className="py-2 px-4 border-b text-left">Speed</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                  <th className="py-2 px-4 border-b text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train) => (
                  <tr key={train._id}>
                    <td className="py-2 px-4 border-b">{train.trainNumber}</td>
                    <td className="py-2 px-4 border-b">{train.trainName}</td>
                    <td className="py-2 px-4 border-b">
                      {train.currentLocation.coordinates[1]}, {train.currentLocation.coordinates[0]}
                    </td>
                    <td className="py-2 px-4 border-b">{train.currentSpeed} km/h</td>
                    <td className="py-2 px-4 border-b">
                      <span 
                        className={`px-2 py-1 rounded text-xs ${
                          train.status === 'running' ? 'bg-green-100 text-green-800' : 
                          train.status === 'stopped' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {train.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {new Date(train.currentLocation.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No trains added yet</p>
        )}
      </div>
    </div>
  );
}