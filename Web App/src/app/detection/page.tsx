'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';

interface AnimalDetection {
  class_id: number;
  class_name: string;
  confidence: number;
}

interface AlertResult {
  alerts: {
    object: string;
    consecutive_count: number;
    last_detection: number;
  }[];
}

export default function AnimalDetector() {
  const [detections, setDetections] = useState<AnimalDetection[]>([]);
  const [alerts, setAlerts] = useState<AlertResult['alerts']>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flaskServerUrl] = useState('https://rail-k-flask-ml.onrender.com'); // Replace with your hosted Flask URL

  // Initialize camera
  const initCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Could not start camera feed');
        });
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setCameraActive(false);
    }
  };

  // Capture frame and send to Flask server
  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) {
      setError('Camera not ready');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image (lower quality for faster transfer)
    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${flaskServerUrl}/api/detect`, {
        frame: imageData
      });
      
      const { objects, alerts } = response.data;
      
      setDetections(objects || []);
      setAlerts(alerts || []);
      setLastUpdated(new Date());
      setError(null);

      // Create detection events and alerts for new detections
      if (objects && objects.length > 0) {
        for (const animal of objects) {
          try {
            const detectionId = await createDetectionEvent(animal);
            await createAlert(detectionId, animal);
          } catch (err) {
            console.error('Error processing detection:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error sending frame to server:', err);
      setError('Failed to communicate with detection server');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a detection event
  const createDetectionEvent = async (animal: AnimalDetection) => {
    try {
      const detectionData = {
        camera: '67d46885230a07d3aee44fe3', // Replace with actual camera ID
        animalType: animal.class_name,
        confidence: animal.confidence,
        imageUrl: 'captured-from-camera', // You can upload this to storage if needed
        status: 'detected',
      };
      
      const response = await axios.post('/api/detections', detectionData);
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
        eventId: detectionId,
        camera: '67d46885230a07d3aee44fe3', // Replace with actual camera ID
        alertType: 'animal_detected',
        alertSeverity: 'high',
        status: 'active',
        affectedTrains: ["67d3421c5a29d6d2dc984465"],
        notifiedStations: ["67d3417a5a29d6d2dc98445f"],
        notes: `Animal detected: ${animal.class_name} with confidence ${(animal.confidence * 100).toFixed(1)}%`,
      };
      await axios.post('/api/alerts', alertData);
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    captureAndDetect();
  };

  // Toggle camera
  const toggleCamera = () => {
    if (cameraActive) {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    } else {
      initCamera();
    }
  };

  useEffect(() => {
    initCamera();
    
    // Initial check after camera is ready
    const initialCheck = setTimeout(() => {
      if (cameraActive) {
        captureAndDetect();
      }
    }, 1000);
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      if (cameraActive) {
        captureAndDetect();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearTimeout(initialCheck);
      clearInterval(intervalId);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: i * 0.1, duration: 0.3 } 
    })
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-500";
    if (confidence > 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="bg-[#121212] text-white min-h-screen p-6"
    >
      {/* Hidden elements for camera processing */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ display: 'none' }}
      />
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
      
      <Card className="bg-[#101828] border-0 shadow-xl">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r text-[#ffff]">
                Camera Detection
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Real-time monitoring and alerts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleCamera}
                className="border-zinc-700 cursor-pointer hover:bg-zinc-400"
              >
                {cameraActive ? 'Disable Camera' : 'Enable Camera'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="border-zinc-700 cursor-pointer hover:bg-zinc-400"
                disabled={isLoading || !cameraActive}
              >
                {isLoading ? (
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Camera Status */}
          <div className="mb-4 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${cameraActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              Camera: {cameraActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="bg-red-900/30 border border-red-800 text-red-300">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Latest Detections */}
          <motion.div 
            variants={cardVariants}
            className="mb-8"
          >
            <h3 className="text-lg font-medium mb-4 text-zinc-200 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>
              Latest Detections
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-zinc-800" />
                <Skeleton className="h-12 w-full bg-zinc-800" />
                <Skeleton className="h-12 w-full bg-zinc-800" />
              </div>
            ) : detections.length > 0 ? (
              <div className="grid gap-3">
                {detections.map((animal, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={listItemVariants}
                    className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg border border-zinc-700"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center mr-3">
                        {animal.class_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-200 capitalize">
                        {animal.class_name.toLowerCase()}
                      </span>
                    </div>
                    <Badge className={`${getConfidenceColor(animal.confidence)} text-white`}>
                      {(animal.confidence * 100).toFixed(1)}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p 
                variants={cardVariants}
                className="text-zinc-500 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800 text-center"
              >
                {cameraActive ? 'No animals detected in the last scan' : 'Camera is disabled'}
              </motion.p>
            )}
          </motion.div>
          
          {/* Active Alerts */}
          <motion.div 
            variants={cardVariants}
            className="mb-8"
          >
            <h3 className="text-lg font-medium mb-4 text-zinc-200 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-2"></span>
              Active Alerts
            </h3>
            
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-zinc-800" />
                <Skeleton className="h-12 w-full bg-zinc-800" />
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={listItemVariants}
                    className="bg-red-900/30 border border-red-800 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-red-300 capitalize">
                        {alert.object.toLowerCase()}
                      </span>
                      <p className="text-zinc-400 text-sm">
                        Consecutive detections: {alert.consecutive_count}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-700 text-red-300">
                      {alert.consecutive_count > 1 ? 'HIGH RISK' : 'WARNING'}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p 
                variants={cardVariants}
                className="text-zinc-500 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800 text-center"
              >
                No consecutive detections
              </motion.p>
            )}
          </motion.div>
          
          {/* Last Updated Time */}
          {lastUpdated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-zinc-500 flex items-center justify-center bg-zinc-800/30 p-2 rounded-lg border border-zinc-800"
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}