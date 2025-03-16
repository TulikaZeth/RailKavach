import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Train, Alert } from "@/types";

interface CameraMapProps {
  cameras: Camera[];
  trains: Train[];
  alerts: Alert[];
  selectedTrain: Train | null;
}

export default function CameraMap({ cameras, trains, alerts, selectedTrain }: CameraMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get camera status (active, inactive, with alert)
  const getCameraStatus = (cameraId: string) => {
    const camera = cameras.find(cam => cam._id === cameraId);
    if (!camera) return "inactive";
    
    if (camera.status !== "active") return "inactive";
    
    const hasActiveAlert = alerts.some(
      alert => alert.camera === cameraId && alert.status === "active"
    );
    
    return hasActiveAlert ? "alert" : "active";
  };

  // Get camera color based on status
  const getCameraColor = (status: string) => {
    switch (status) {
      case "alert":
        return "bg-red-500";
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  // Convert geo coordinates to map coordinates
  const convertToMapCoords = (lon: number, lat: number) => {
    // This is a simplified conversion for demo purposes
    // In a real app, you'd use proper map projection
    const mapWidth = mapRef.current?.clientWidth || 800;
    const mapHeight = mapRef.current?.clientHeight || 400;
    
    // Normalize coordinates to range [0, 1]
    const normalizedX = (lon + 180) / 360;
    const normalizedY = (90 - lat) / 180;
    
    return {
      x: normalizedX * mapWidth,
      y: normalizedY * mapHeight
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Railway Network Map</h2>
      
      <div 
        ref={mapRef}
        className="relative w-full h-96 bg-gray-200 rounded-md overflow-hidden"
      >
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <>
            {/* Map background */}
            <div className="absolute inset-0 bg-blue-50">
              {/* Railway lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                <path 
                  d="M0,200 C300,180 500,220 800,200" 
                  stroke="#6B7280" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"
                />
                <path 
                  d="M100,100 C200,220 400,180 600,300" 
                  stroke="#6B7280" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Cameras */}
              {cameras.map((camera) => {
                const status = getCameraStatus(camera._id);
                const { x, y } = convertToMapCoords(
                  camera.location.coordinates[0],
                  camera.location.coordinates[1]
                );
                
                return (
                  <motion.div
                    key={camera._id}
                    className="absolute"
                    style={{ left: x, top: y }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    title={camera.cameraId}
                  >
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${getCameraColor(status)}`}>
                        {status === "alert" && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-red-500 opacity-50"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>
                      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs white-space-nowrap">
                        <span className="bg-gray-800 text-white px-1 rounded text-xs">
                          {camera.cameraId}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Trains */}
              {trains.map((train) => {
                const { x, y } = convertToMapCoords(
                  train.currentLocation.coordinates[0],
                  train.currentLocation.coordinates[1]
                );
                
                // Highlight the selected train
                const isSelected = selectedTrain && selectedTrain._id === train._id;
                
                return (
                  <motion.div
                    key={train._id}
                    className="absolute"
                    style={{ left: x, top: y }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    title={`${train.trainName} (${train.trainNumber})`}
                  >
                    <div className={`relative ${isSelected ? 'z-10' : 'z-0'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-600' : 'bg-gray-700'
                      }`}>
                        <span className="text-white text-xs">🚂</span>
                      </div>
                      {isSelected && (
                        <motion.div
                          className="absolute -inset-1 rounded-full border-2 border-blue-400"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <div className="absolute top-7 left-1/2 transform -translate-x-1/2 text-xs white-space-nowrap">
                        <span className={`px-1 rounded text-xs ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'
                        }`}>
                          {train.trainNumber}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Active Camera</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Alert Detected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
            <span>Inactive Camera</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-700 mr-1"></div>
            <span>Train</span>
          </div>
        </div>
      </div>
    </div>
  );
}