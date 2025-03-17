'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getLatestDetections, getAlerts, AnimalDetection, AlertResult } from '@/services/detectionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw } from 'lucide-react';

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
      console.log(detectionData);
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

  // Manual refresh handler
  const handleRefresh = () => {
    checkForAnimals();
  };

  useEffect(() => {
    // Initial check
    checkForAnimals();
    // Set up polling interval
    const intervalId = setInterval(checkForAnimals, 30000); // Check every 30 seconds
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

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
      <Card className="bg-[#101828] border-0 shadow-xl">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r text-[#ffff] ">
                Camera Detection
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Real-time monitoring and alerts
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="border-zinc-700 cursor-pointer hover:bg-zinc-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCcw  className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
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
                      <span className="font-medium text-zinc-200">{animal.class_name}</span>
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
                No animals detected in the last scan
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
                      <span className="font-bold text-red-300">{alert.object}</span>
                      <p className="text-zinc-400 text-sm">
                        Consecutive detections: {alert.consecutive_count}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-red-700 text-red-300">
                      HIGH RISK
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