import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Train, Alert } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, AlertTriangle, Check, Activity, MapPin, User, Hash, Volume2 } from "lucide-react";

interface TrainStatusCardProps {
  train: Train;
  alerts: Alert[];
}



export default function TrainStatusCard({ train: initialTrain, alerts = [] }: TrainStatusCardProps) {


  const [train, setTrain] = useState(initialTrain);
  const [distanceToAlert, setDistanceToAlert] = useState<number | null>(null);
  const [isSlowingDown, setIsSlowingDown] = useState(false);
  const [playedAudio, setPlayedAudio] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const speedGaugeRef = useRef<HTMLDivElement>(null);
  
  const [alertText, setAlertText] = useState<string>('');

  // Filter out resolved alerts
  const unresolvedAlerts = alerts.filter((alert) => alert.status !== "resolved");
  
  const getSpeedIndicatorColor = (speed: number) => {
    if (speed < 30) return "bg-green-500";
    if (speed < 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getSpeedGaugeRotation = (speed: number) => {
    // Map speed from 0-100 to -120 to 120 degrees for the gauge
    const maxSpeed = IntialSpeed+10;
    const minDegree = -120;
    const maxDegree = 120;
    const degree = (speed / maxSpeed) * (maxDegree - minDegree) + minDegree;
    return Math.min(maxDegree, Math.max(minDegree, degree));
  };
  
  const getSpeedReduction = (distance: number | null) => {
    if (distance === null) return "None";
    if (distance <= 1) return "Full Stop (Aggressive)";
    if (distance <= 2) return "Significant Reduction (Moderate)";
    if (distance <= 5) return "Slight Reduction";
    return "None";
  };
  
  const [IntialSpeed, setIntialSpeed] = useState(100)

  useEffect(() => {
    setIntialSpeed(initialTrain.currentSpeed)
  }, [])

  const calcSafeDistance = async (speed: number, lat: number, long: number) => {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed, lat, long }),
      });
  
      const data = await response.json();
      return data.distance || 5;
    } catch (error) {
      console.error("Error calling local API:", error);
      return 0;
    }
  }

  useEffect(() => {
    if (isStopped) return; // Stop all updates if the train is stopped
    
    let directionX = Math.random() * 0.0001 - 0.00005;
    let directionY = Math.random() * 0.0001 - 0.00005;
    let currentSpeed = initialTrain.currentSpeed;
    
    const safeDistance = calcSafeDistance(currentSpeed, train.currentLocation.coordinates[1], train.currentLocation.coordinates[0]);
    console.log(safeDistance)

    const movementInterval = setInterval(() => {
      // Only trigger alerts if there are unresolved alerts
      if (unresolvedAlerts.length > 0 && distanceToAlert === null && Math.random() < 0.1) {
        const newDistance = Math.floor(Math.random() * 10) + 1;
        setDistanceToAlert(newDistance);
        if (!playedAudio) {
          console.log("VOICE ALERT: Animal detected ahead!");
          setAlertText(`Animal detected ahead. Train stopping in ${newDistance} kilometers.`);
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
            setAlertText('Train Stopped due to animal on track.');
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
  

  useEffect(() => {
    if (alertText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(alertText);
      utterance.lang = 'en-US'; // Set the language
      utterance.rate = 1; // Speed of speech (0.1 to 10)
      utterance.pitch = 1; // Pitch of speech (0 to 2)
      window.speechSynthesis.speak(utterance);
    } else if (!('speechSynthesis' in window)) {
      console.error('Web Speech API is not supported in this browser.');
    }
  }, [alertText]); // Run this effect whenever alertText changes

 

  const speedReduction = getSpeedReduction(distanceToAlert);
  
  return (
    <Card className="max-w-md mx-auto bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 overflow-hidden shadow-lg">
      <CardHeader className="bg-gray-800/60 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-blue-400">Train Status</CardTitle>
          <Badge variant={isStopped ? "destructive" : train.status === "on-time" ? "default" : "secondary"} className="uppercase">
            {isStopped ? "Stopped" : train.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-200">{train.trainName}</h3>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <Hash className="w-4 h-4 mr-1" />
              {train.trainNumber}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-300">{train.driver.name}</p>
              <p className="text-xs text-gray-500">{train.driver.contactNumber}</p>
            </div>
          </div>
        </div>
        
       

       {/* Speed Gauge */}
       <div className="relative h-40 flex items-center justify-center my-4">

{/* Outer semi-circle of the gauge */}
<div className="absolute w-40 h-20 overflow-hidden">
  <div className="w-40 h-40 rounded-full mt-2 border-8 border-white/20" />
</div>

{/* Speed gauge ticks */}
<div className="absolute w-40 h-40">
  {[...Array(11)].map((_, i) => {
    const rotation = -120 + i * 24; // -120 to 120 degrees, 11 ticks
    return (
      <div 
        key={i} 
        className="absolute w-1 h-4 bg-gray-600"
        style={{
          left: '50%',
          top: '10%',
          transformOrigin: 'bottom center',
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        }}
      />
    );
  })}
</div>

{/* Speed values (bold and clear) */}
<div className="absolute text-sm font-bold text-gray-800 -bottom-2 left-6">0</div>
<div className="absolute text-sm font-bold text-gray-800 -top-2 left-1/2 transform -translate-x-1/2">50</div>
<div className="absolute text-sm font-bold text-gray-800 -bottom-2 right-6">100</div>

{/* Gauge needle (thicker and more prominent) */}
<motion.div 
  ref={speedGaugeRef}
  className="absolute bottom-0 w-2 h-20 bg-red-600 rounded-t-full origin-bottom"
  style={{ transformOrigin: 'bottom center' }}
  animate={{ rotate: getSpeedGaugeRotation(train.currentSpeed) }}
  transition={{ type: "spring", stiffness: 50, damping: 10 }}
/>

{/* Center cap (industrial look) */}
<div className="absolute bottom-0 w-6 h-6 rounded-full bg-gray-900 border-4 border-gray-700 transform translate-y-2" />

{/* Digital speed display (industrial font) */}
<motion.div 
  className="absolute -bottom-6 text-center bg-gray-900 px-4 py-2 rounded-lg border-2 border-gray-700"
  animate={{
    scale: isSlowingDown ? [1, 1.05, 1] : 1,
  }}
  transition={{ duration: 0.5, repeat: isSlowingDown ? Infinity : 0 }}
>
  <span className="text-xl font-bold text-gray-200" style={{ fontFamily: "'Orbitron', sans-serif" }}>
    {train.currentSpeed.toFixed(1)}
  </span>
  <span className="text-sm text-gray-400 ml-1">km/h</span>
</motion.div>

{/* "Reducing Speed" notification (industrial style) */}
{isSlowingDown && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute top-1/4 bg-red-800 text-red-100 px-3 py-1 rounded-full text-xs font-bold"
  >
    Reducing Speed
  </motion.div>
)}
</div>
        
        <div className="grid mt-12 grid-cols-2 gap-4">
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center text-gray-400 text-sm mb-1">
              <Activity className="w-4 h-4 mr-1" />
              Speed Status
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getSpeedIndicatorColor(train.currentSpeed)} mr-2`}></div>
              <p className="font-medium text-gray-200">
                {train.currentSpeed < 30 ? "Normal" : train.currentSpeed < 60 ? "Elevated" : "High"}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
            <div className="flex items-center text-gray-400 text-sm mb-1">
              <MapPin className="w-4 h-4 mr-1" />
              Location
            </div>
            <motion.div
              key={`${train.currentLocation.coordinates[0]}-${train.currentLocation.coordinates[1]}`}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-medium text-gray-200 text-sm truncate">
                {train.currentLocation.coordinates[1].toFixed(6)}, {train.currentLocation.coordinates[0].toFixed(6)}
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Updated timestamp */}
        <div className="text-center text-xs text-gray-500">
          Last updated: {new Date(train.currentLocation.updatedAt).toLocaleTimeString()}
        </div>
        
        {unresolvedAlerts.length > 0 && distanceToAlert !== null && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-amber-400 mr-2" />
                  <p className="text-sm font-medium text-amber-300">Alert Distance</p>
                </div>
                {isSlowingDown && (
                  <motion.div
                    className="px-2 py-1 bg-red-900/80 text-red-100 text-xs rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Speed Reduction
                  </motion.div>
                )}
              </div>
              
              <div className="relative mb-2">
                <Progress value={(10 - (distanceToAlert || 0)) * 10} className="h-2" />
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>10km</span>
                <motion.span
                  className="font-semibold text-amber-400"
                  key={distanceToAlert}
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  {distanceToAlert.toFixed(1)}km
                </motion.span>
                <span>0km</span>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="text-gray-400">Speed Reduction: </span>
                <span className={`font-medium ${
                  speedReduction === "None" 
                    ? "text-green-400" 
                    : speedReduction === "Slight Reduction" 
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}>
                  {speedReduction}
                </span>
              </div>
            </div>
            
{/* Alert Status */}
<motion.div
              className={`p-4 rounded-lg border ${
                distanceToAlert <= 1 
                  ? "bg-red-900/30 border-red-700" 
                  : distanceToAlert <= 5 
                  ? "bg-amber-900/30 border-amber-700" 
                  : "bg-green-900/30 border-green-700"
              }`}
              animate={{
                scale: [1, 1.02, 1],
                borderColor: [
                  distanceToAlert <= 1 ? "rgb(185, 28, 28)" : distanceToAlert <= 5 ? "rgb(217, 119, 6)" : "rgb(21, 128, 61)",
                  distanceToAlert <= 1 ? "rgb(220, 38, 38)" : distanceToAlert <= 5 ? "rgb(245, 158, 11)" : "rgb(22, 163, 74)",
                  distanceToAlert <= 1 ? "rgb(185, 28, 28)" : distanceToAlert <= 5 ? "rgb(217, 119, 6)" : "rgb(21, 128, 61)",
                ],
              }}
              transition={{
                duration: distanceToAlert <= 1 ? 0.5 : 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {distanceToAlert <= 1 ? (
                <div className="flex items-center">
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="mr-2 text-red-500"
                  >
                    <AlertCircle className="w-5 h-5" />
                  </motion.div>
                  <p className="font-medium text-red-300">WARNING: Animal Detected - Train Stopped</p>
                </div>
              ) : distanceToAlert <= 5 ? (
                <div className="flex items-center">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mr-2 text-amber-500"
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </motion.div>
                  <p className="font-medium text-amber-300">CAUTION: Animal Detected - Reducing Speed</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  <p className="font-medium text-green-300">Monitoring: Animal Detected - Safe Distance</p>
                </div>
              )}
              
              {/* Alert details */}
              <div className="mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Alert Type:</span>
                  <span className="font-medium text-gray-200">Animal Detection</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-400">Alert Priority:</span>
                  <Badge variant={distanceToAlert <= 1 ? "destructive" : distanceToAlert <= 5 ? "outline" : "secondary"}>
                    {distanceToAlert <= 1 ? "Critical" : distanceToAlert <= 5 ? "High" : "Medium"}
                  </Badge>
                </div>
              </div>
            </motion.div>
            
            {/* Voice Alert */}
            {distanceToAlert <= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-800/80 p-4 rounded-lg border border-gray-700"
              >
                <div className="flex items-start">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      color: ["rgb(248, 113, 113)", "rgb(239, 68, 68)", "rgb(248, 113, 113)"]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="mr-3 text-red-400"
                  >
                    <Volume2 className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="font-medium text-gray-300">Voice Alert Activated:</p>
                    <p className="text-red-400 italic text-sm mt-1">
                      "WARNING! Animal on track. Emergency braking initiated. Animal detected {distanceToAlert.toFixed(1)} kilometers ahead."
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Clear Track Status */}
        {(unresolvedAlerts.length === 0 || distanceToAlert === null) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-800/80 p-4 rounded-lg border border-green-700"
          >
            <motion.div
              className="flex items-center"
              animate={{
                scale: [1, 1.02, 1],
                color: ["rgb(74, 222, 128)", "rgb(34, 197, 94)", "rgb(74, 222, 128)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Check className="w-5 h-5 mr-2" />
              <p className="font-medium text-green-300">
                Clear Track Ahead - Normal Operation
              </p>
            </motion.div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Next Station:</span>
                <span className="font-medium text-gray-200">Central Station</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-400">ETA:</span>
                <span className="font-medium text-gray-200">12 minutes</span>
              </div>
              <div className="mt-2">
                <Progress value={75} className="h-1" />
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Previous Station</span>
                  <span>Next Station</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}