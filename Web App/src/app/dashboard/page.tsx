"use client";
import { useState, useEffect } from "react";
import AlertsPanel from "@/components/AlertsPanel";
import { fetchDummyData } from "@/lib/api";
import { Train, Alert, Camera } from "@/types";
import TrainStatusCard from "@/components/TrainStatusCard";

export default function Dashboard() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDummyData();
        setTrains(data.trains);
        setAlerts(data.alerts);
        setCameras(data.cameras);
        if (data.trains.length > 0) {
          setSelectedTrain(data.trains[0].trainNumber);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    // Simulating real-time updates
    const interval = setInterval(() => {
      updateRandomAlert();
      updateTrainPositions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const updateRandomAlert = () => {
    if (alerts.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * alerts.length);
    const updatedAlerts = [...alerts];
    
    // Simulate a status change
    const newStatus = ["active", "acknowledged", "resolved", "false_alarm"][Math.floor(Math.random() * 4)];
    updatedAlerts[randomIndex] = {
      ...updatedAlerts[randomIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    setAlerts(updatedAlerts);
  };

  const updateTrainPositions = () => {
    if (trains.length === 0) return;
    
    const updatedTrains = trains.map(train => {
      // Randomly update train position
      const newLon = train.currentLocation.coordinates[0] + (Math.random() * 0.01 - 0.005);
      const newLat = train.currentLocation.coordinates[1] + (Math.random() * 0.01 - 0.005);
      
      // Simulate speed changes
      let newSpeed = train.currentSpeed;
      const hasNearbyAlert = alerts.some(alert => 
        alert.status === "active" && 
        alert.affectedTrains.some(t => t === train._id)
      );
      
      if (hasNearbyAlert) {
        // Reduce speed if there's an active alert
        newSpeed = Math.max(0, train.currentSpeed - Math.random() * 10);
      } else {
        // Otherwise normal speed fluctuation
        newSpeed = Math.max(0, Math.min(120, train.currentSpeed + (Math.random() * 10 - 5)));
      }
      
      return {
        ...train,
        currentLocation: {
          ...train.currentLocation,
          coordinates: [newLon, newLat],
          updatedAt: new Date().toISOString()
        },
        currentSpeed: newSpeed
      };
    });
    
    setTrains(updatedTrains);
  };

  const handleTrainSelect = (trainNumber: string) => {
    setSelectedTrain(trainNumber);
  };

  const selectedTrainData = trains.find(train => train.trainNumber === selectedTrain);
  const activeAlerts = alerts.filter(alert => alert.status === "active");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 text-white p-4 shadow-md border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">Rail Kavach</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeAlerts.length}
              </span>
              <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Train Overview Section */}
          <div className="md:col-span-12 bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">Train Overview</h2>
              <div className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full text-sm font-medium border border-blue-700">
                {trains.length} Trains Active
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {trains.map(train => (
                <button
                  key={train.trainNumber}
                  onClick={() => handleTrainSelect(train.trainNumber)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedTrain === train.trainNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  {train.trainNumber}
                </button>
              ))}
            </div>
            
            {/* Train Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {trains.map(train => (
                <div 
                  key={train._id} 
                  className={`p-4 rounded-lg border ${
                    selectedTrain === train.trainNumber 
                      ? "border-blue-500 bg-gray-700" 
                      : "border-gray-600 bg-gray-700 hover:bg-gray-700/50 cursor-pointer"
                  }`}
                  onClick={() => handleTrainSelect(train.trainNumber)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{train.trainNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      train.currentSpeed > 80 
                        ? "bg-green-900 text-green-300 border border-green-700" 
                        : train.currentSpeed > 30 
                          ? "bg-yellow-900 text-yellow-300 border border-yellow-700" 
                          : "bg-red-900 text-red-300 border border-red-700"
                    }`}>
                      {Math.round(train.currentSpeed)} km/h
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    {/* {train.route.departureStation} → {train.route.arrivalStation} */}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Left Column */}
          <div className="md:col-span-8">
            {/* Selected Train Details */}
            {selectedTrainData && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-400">Train Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-200">{selectedTrainData.trainNumber}</h3>
                    <p className="text-gray-400 mb-1">
                      {/* <span className="font-medium text-gray-300">Route:</span> {selectedTrainData.route.departureStation} → {selectedTrainData.route.arrivalStation} */}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="font-medium text-gray-300">Status:</span> {selectedTrainData.status}
                    </p>
                    <p className="text-gray-400 mb-1">
                      <span className="font-medium text-gray-300">Speed:</span> {Math.round(selectedTrainData.currentSpeed)} km/h
                    </p>
                  </div>
                  <div>
                    <div className="flex flex-col h-full justify-center">
                      <div className="w-full bg-gray-700 rounded-full h-4 mb-2 border border-gray-600">
                        <div 
                          className="bg-blue-600 h-4 rounded-full" 
                          style={{ width: `${Math.min(100, (selectedTrainData.currentSpeed / 120) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0 km/h</span>
                        <span>120 km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-md font-medium mb-2 text-gray-300">Location Coordinates</h3>
                  <div className="bg-gray-700 p-3 rounded-md border border-gray-600">
                    <p className="text-gray-300 font-mono text-sm">
                      Lat: {selectedTrainData.currentLocation.coordinates[1].toFixed(6)}, 
                      Lon: {selectedTrainData.currentLocation.coordinates[0].toFixed(6)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Last updated: {new Date(selectedTrainData.currentLocation.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Alerts Panel */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
              <AlertsPanel 
                alerts={alerts} 
                selectedTrain={selectedTrainData} 
                cameras={cameras} 
              />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="md:col-span-4">
            {/* Train Status Card */}
            {selectedTrainData && (
              <TrainStatusCard alerts={alerts} train={selectedTrainData} />
            )}
            
            {/* Alert Stats */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Alert Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-900/30 p-4 rounded-lg border border-red-800">
                  <div className="text-red-400 text-2xl font-bold">
                    {alerts.filter(a => a.status === "active").length}
                  </div>
                  <div className="text-red-300 text-sm">Active Alerts</div>
                </div>
                <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-800">
                  <div className="text-yellow-400 text-2xl font-bold">
                    {alerts.filter(a => a.status === "acknowledged").length}
                  </div>
                  <div className="text-yellow-300 text-sm">Acknowledged</div>
                </div>
                <div className="bg-green-900/30 p-4 rounded-lg border border-green-800">
                  <div className="text-green-400 text-2xl font-bold">
                    {alerts.filter(a => a.status === "resolved").length}
                  </div>
                  <div className="text-green-300 text-sm">Resolved</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="text-gray-300 text-2xl font-bold">
                    {alerts.filter(a => a.status === "false_alarm").length}
                  </div>
                  <div className="text-gray-400 text-sm">False Alarms</div>
                </div>
              </div>
            </div>
            
            {/* Camera Status */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Camera Status</h2>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                <div className="text-gray-300">Total Cameras</div>
                <div className="font-bold text-white">{cameras.length}</div>
              </div>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                <div className="text-gray-300 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Online
                </div>
                <div className="font-bold text-green-400">
                  {cameras.filter(c => c.status === "online").length || 1}
                </div>
              </div>
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                <div className="text-gray-300 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  Offline
                </div>
                <div className="font-bold text-red-400">
                  {cameras.filter(c => c.status === "offline").length}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-gray-300 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  Maintenance
                </div>
                <div className="font-bold text-yellow-400">
                  {cameras.filter(c => c.status === "maintenance").length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}