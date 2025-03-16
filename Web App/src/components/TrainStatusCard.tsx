import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Train, Alert } from "@/types";

interface TrainStatusCardProps {
  train: Train;
  alerts: Alert[]; // Add alerts as a prop
}

export default function TrainStatusCard({ train: initialTrain, alerts = [] }: TrainStatusCardProps) {
  const [train, setTrain] = useState(initialTrain);
  const [distanceToAlert, setDistanceToAlert] = useState<number | null>(null);
  const [isSlowingDown, setIsSlowingDown] = useState(false);
  const [playedAudio, setPlayedAudio] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  
  // Filter out resolved alerts
  const unresolvedAlerts = alerts.filter((alert) => alert.status !== "resolved");
  
  const getSpeedIndicatorColor = (speed: number) => {
    if (speed < 30) return "bg-green-500";
    if (speed < 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getSpeedReduction = (distance: number | null) => {
    if (distance === null) return "None";
    if (distance <= 1) return "Full Stop (Aggressive)";
    if (distance <= 2) return "Significant Reduction (Moderate)";
    if (distance <= 5) return "Slight Reduction";
    return "None";
  };
  
  useEffect(() => {
    if (isStopped) return; // Stop all updates if the train is stopped
    
    let directionX = Math.random() * 0.0001 - 0.00005;
    let directionY = Math.random() * 0.0001 - 0.00005;
    let currentSpeed = initialTrain.currentSpeed;
    
    const movementInterval = setInterval(() => {
      // Only trigger alerts if there are unresolved alerts
      if (unresolvedAlerts.length > 0 && distanceToAlert === null && Math.random() < 0.1) {
        const newDistance = Math.floor(Math.random() * 10) + 1;
        setDistanceToAlert(newDistance);
        if (!playedAudio) {
          console.log("VOICE ALERT: Animal detected ahead!");
          setPlayedAudio(true);
        }
      }
      
      if (distanceToAlert !== null) {
        setDistanceToAlert((prevDistance) => {
          const newDistance = Math.max(0, prevDistance - 0.1);
          if (newDistance <= 5) {
            setIsSlowingDown(true);
          }
          if (newDistance <= 0) {
            setIsStopped(true); // Stop the train
            setDistanceToAlert(null);
            setIsSlowingDown(false);
            setPlayedAudio(false);
          }
          return newDistance;
        });
      }
      
      if (isSlowingDown) {
        // Calculate the slowdown factor based on distance
        let slowdownFactor = 0;
        if (distanceToAlert !== null) {
          if (distanceToAlert <= 1) {
            slowdownFactor = 5; // Aggressive slowdown for very close alerts
          } else if (distanceToAlert <= 2) {
            slowdownFactor = 3; // Moderate slowdown for close alerts
          } else if (distanceToAlert <= 5) {
            slowdownFactor = 1.5; // Slight slowdown for alerts further away
          }
        }
        currentSpeed = Math.max(0, currentSpeed - slowdownFactor); // Ensure speed doesn't go below 0
        if (currentSpeed === 0) {
          setIsStopped(true); // Stop the train
        }
      } else if (currentSpeed < initialTrain.currentSpeed) {
        // Gradually resume speed when alert is cleared
        currentSpeed = Math.min(initialTrain.currentSpeed, currentSpeed + 0.5);
      } else {
        // Small random fluctuations in normal speed
        currentSpeed = Math.max(10, Math.min(initialTrain.currentSpeed + 5, currentSpeed + (Math.random() * 0.5 - 0.25)));
      }
      
      setTrain((prev) => {
        const movementFactor = isSlowingDown ? 0.3 : 1;
        directionX += Math.random() * 0.00002 - 0.00001;
        directionY += Math.random() * 0.00002 - 0.00001;
        directionX = Math.max(-0.0001, Math.min(0.0001, directionX));
        directionY = Math.max(-0.0001, Math.min(0.0001, directionY));
        
        const newCoordinates = [
          prev.currentLocation.coordinates[0] + directionX * movementFactor,
          prev.currentLocation.coordinates[1] + directionY * movementFactor,
        ];
        
        return {
          ...prev,
          currentSpeed: currentSpeed,
          currentLocation: {
            ...prev.currentLocation,
            coordinates: newCoordinates,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    }, 1000); // Update every second for smoother speed reduction
    
    return () => clearInterval(movementInterval);
  }, [initialTrain.currentSpeed, distanceToAlert, isSlowingDown, playedAudio, isStopped, unresolvedAlerts]);
  
  const speedReduction = getSpeedReduction(distanceToAlert);
  
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">Train Status</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-200">{train.trainName}</h3>
        <p className="text-gray-400 text-sm">{train.trainNumber}</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400 mb-1">Current Speed</p>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getSpeedIndicatorColor(train.currentSpeed)} mr-2`}></div>
            <motion.p
              className="font-semibold text-gray-200"
              key={train.currentSpeed}
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {train.currentSpeed.toFixed(1)} km/h
              {isSlowingDown && (
                <span className="text-red-400 ml-2 text-sm font-normal">↓ Reducing Speed</span>
              )}
            </motion.p>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-1">Status</p>
          <p className="font-semibold text-gray-200 capitalize">{train.status}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-1">Driver</p>
          <p className="font-semibold text-gray-200">{train.driver.name}</p>
          <p className="text-xs text-gray-500">{train.driver.contactNumber}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-1">Current Location</p>
          <motion.div
            key={`${train.currentLocation.coordinates[0]}-${train.currentLocation.coordinates[1]}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-semibold text-gray-200">
              {train.currentLocation.coordinates[1].toFixed(6)}, {train.currentLocation.coordinates[0].toFixed(6)}
            </p>
            <p className="text-xs text-gray-500">
              Updated: {new Date(train.currentLocation.updatedAt).toLocaleTimeString()}
            </p>
          </motion.div>
        </div>
        
        {unresolvedAlerts.length > 0 && distanceToAlert !== null && (
          <>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Nearest Alert</p>
                {isSlowingDown && (
                  <motion.div
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Speed Reduction Active
                  </motion.div>
                )}
              </div>
              <motion.p
                className="font-semibold text-amber-400"
                key={distanceToAlert}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 0.5 }}
              >
                {distanceToAlert.toFixed(1)} km away
              </motion.p>
              <p className="text-sm mt-1">
                <span className="text-gray-400">Speed Reduction: </span>
                <span className={`font-medium ${speedReduction === "None" ? "text-green-400" : "text-red-400"}`}>
                  {speedReduction}
                </span>
              </p>
            </div>
            
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className={`p-4 rounded-lg text-white font-medium ${
                distanceToAlert <= 1 
                  ? "bg-red-900 border border-red-700" 
                  : distanceToAlert <= 5 
                  ? "bg-amber-800 border border-amber-700" 
                  : "bg-green-900 border border-green-700"
              }`}
            >
              {distanceToAlert <= 1 ? (
                <div className="flex items-center">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="mr-2"
                  >
                    🚨
                  </motion.span>
                  WARNING: Animal Detected - Train Stopped
                </div>
              ) : distanceToAlert <= 5 ? (
                <div className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  CAUTION: Animal Detected - Prepare to Reduce Speed
                </div>
              ) : (
                "Clear Track Ahead"
              )}
            </motion.div>
            
            {distanceToAlert <= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-900/30 p-4 rounded-lg border border-red-800"
              >
                <div className="flex items-start">
                  <span className="text-red-400 text-2xl mr-2">🔊</span>
                  <div>
                    <p className="font-medium text-red-300">Voice Alert Played:</p>
                    <p className="text-red-400 italic">
                      "Warning! Animal on track. Train has stopped. Animal is approximately {distanceToAlert.toFixed(1)} kilometers ahead."
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        
        {unresolvedAlerts.length === 0 && (
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="p-4 rounded-lg text-white font-medium bg-green-800 border border-green-700"
          >
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              Clear Track Ahead
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}