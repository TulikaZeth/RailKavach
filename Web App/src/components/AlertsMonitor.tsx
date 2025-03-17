import React, { useEffect, useState } from "react";
import { Alert, TrainData } from "@/app/dashboard/page";
import { AlertTriangle, AlertCircle, GaugeCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AlertsMonitorProps {
  train: TrainData;
  onSlowDown: (targetSpeed: number) => void;
  onResume: () => void;
}

const AlertsMonitor: React.FC<AlertsMonitorProps> = ({
  train,
  onSlowDown,
  onResume,
}) => {
  const [nearbyAlerts, setNearbyAlerts] = useState<Alert[]>([]);
  const [monitorStatus, setMonitorStatus] = useState<"idle" | "monitoring" | "slowing" | "stopped">("idle");
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [speedTarget, setSpeedTarget] = useState<number>(train?.maxSpeed || 120);
  const [currentSpeed, setCurrentSpeed] = useState<number>(train?.currentSpeed || 0);
  
  // Function to calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lon1: number, 
    lat1: number, 
    lon2: number, 
    lat2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
  
  // Fetch alerts from the API
  const fetchAlerts = async () => {
    try {
      // Set current date/time for filtering
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
      
      // We only want recent and active alerts
      const params = new URLSearchParams({
        status: 'active',
        startDate: fiveMinutesAgo.toISOString(),
        limit: '50'
      });
      
      const response = await fetch(`/api/alerts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      setLastFetchTime(new Date().toLocaleTimeString());
      
      // Process alerts to find nearby ones
      processAlerts(data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Alert System Error",
        description: "Failed to fetch recent alerts. Safety monitoring may be compromised.",
        variant: "destructive"
      });
    }
  };
  
  // Process the alerts to find ones near the train
  const processAlerts = (alerts: Alert[]) => {
    if (!train || !train.currentLocation) return;
    
    const trainLon = train.currentLocation.coordinates[0];
    const trainLat = train.currentLocation.coordinates[1];
    
    // Filter alerts within 2km of the train
    const nearby = alerts.filter(alert => {
      if (!alert.camera || !alert.camera.location || !alert.camera.location.coordinates) {
        return false;
      }
      
      const alertLon = alert.camera.location.coordinates[0];
      const alertLat = alert.camera.location.coordinates[1];
      
      const distance = calculateDistance(trainLon, trainLat, alertLon, alertLat);
      return distance <= 2; // 2 kilometers
    });
    
    setNearbyAlerts(nearby);
    
    // Determine if speed adjustments are needed
    if (nearby.length > 0) {
      handleAlertsDetected(nearby);
    } else if (monitorStatus === "slowing" || monitorStatus === "stopped") {
      // No alerts nearby, can resume normal speed
      handleClearZone();
    }
  };
  
  // Handle when alerts are detected nearby
  const handleAlertsDetected = (alerts: Alert[]) => {
    // Check for high severity alerts
    const criticalAlerts = alerts.filter(a => 
      a.alertSeverity === 'high' || 
      a.alertSeverity === 'critical'
    );
    
    const animalAlerts = alerts.filter(a => 
      a.alertType === 'animal_detected' || 
      a.alertType === 'animal_persistent'
    );
    
    if (criticalAlerts.length > 0) {
      // Critical alerts - slow to 20km/h
      toast({
        title: "⚠️ CRITICAL ALERT DETECTED",
        description: "Critical hazard detected ahead. Train speed reduced to 20km/h.",
        variant: "destructive",
        duration: 10000,
      });
      setSpeedTarget(20);
      onSlowDown(20);
      setMonitorStatus("slowing");
    } else if (animalAlerts.length > 0) {
      // Animal alerts - slow to 40km/h
      toast({
        title: "⚠️ Animal Detected",
        description: "Animals detected near tracks. Train speed reduced to 40km/h.",
        variant: "warning",
        duration: 7000,
      });
      setSpeedTarget(40);
      onSlowDown(40);
      setMonitorStatus("slowing");
    } else {
      // Other alerts - slow to 60km/h
      toast({
        title: "Alert Detected",
        description: "Alert detected near tracks. Train speed reduced to 60km/h.",
        duration: 5000,
      });
      setSpeedTarget(60);
      onSlowDown(60);
      setMonitorStatus("slowing");
    }
  };
  
  // Handle when no more alerts are in the vicinity
  const handleClearZone = () => {
    if (monitorStatus === "slowing" || monitorStatus === "stopped") {
      toast({
        title: "Clear Zone",
        description: "No alerts detected. Resuming normal speed.",
      });
      setSpeedTarget(train?.maxSpeed || 120);
      onResume();
      setMonitorStatus("monitoring");
    }
  };

  // Simulate speed changes
  useEffect(() => {
    if (!train) return;
    
    setCurrentSpeed(train.currentSpeed || 0);
    
    const intervalId = setInterval(() => {
      setCurrentSpeed(prev => {
        // Gradually approach target speed
        if (Math.abs(prev - speedTarget) < 1) return speedTarget;
        return prev > speedTarget 
          ? Math.max(prev - 2, speedTarget) 
          : Math.min(prev + 2, speedTarget);
      });
    }, 300);
    
    return () => clearInterval(intervalId);
  }, [train, speedTarget]);
  
  // Set up the alert monitor to fetch alerts every minute
  useEffect(() => {
    if (!train) return;
    
    setMonitorStatus("monitoring");
    // Fetch immediately on mount
    fetchAlerts();
    
    // Then fetch every minute
    const intervalId = setInterval(fetchAlerts, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [train]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
            Safety Monitor
          </CardTitle>
          <Badge variant={
            monitorStatus === "idle" ? "outline" :
            monitorStatus === "monitoring" ? "default" :
            monitorStatus === "slowing" ? "warning" : "destructive"
          } className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              monitorStatus === "idle" ? "bg-gray-400" :
              monitorStatus === "monitoring" ? "bg-green-500" :
              monitorStatus === "slowing" ? "bg-yellow-500" :
              "bg-red-500"
            }`}></span>
            {monitorStatus === "idle" ? "Standby" :
             monitorStatus === "monitoring" ? "Active" :
             monitorStatus === "slowing" ? "Speed Reduction" :
             "Emergency Stop"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-3 text-sm">
          <span className="text-gray-500">Last check: <span className="font-medium">{lastFetchTime || "Never"}</span></span>
          <span className="text-gray-500">Nearby alerts: <span className={`font-bold ${nearbyAlerts.length > 0 ? "text-red-500" : "text-green-500"}`}>
            {nearbyAlerts.length}
          </span></span>
        </div>
        
        <Separator className="my-3" />
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <GaugeCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Current Speed</span>
            </div>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: monitorStatus === "slowing" ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5, repeat: monitorStatus === "slowing" ? Infinity : 0, repeatDelay: 1 }}
              className="text-lg font-bold"
            >
              {Math.round(currentSpeed)} km/h
            </motion.div>
          </div>
          
          <div className="relative pt-1">
            <Progress 
              value={(currentSpeed / (train?.maxSpeed || 120)) * 100} 
              className="h-2"
              indicatorColor={
                monitorStatus === "slowing" ? "bg-yellow-500" :
                monitorStatus === "stopped" ? "bg-red-500" : "bg-green-500"
              }
            />
            <motion.div 
              className="absolute h-4 w-1 bg-blue-700 rounded-full -mt-3 z-10"
              style={{ 
                left: `${(speedTarget / (train?.maxSpeed || 120)) * 100}%`, 
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>Target: {speedTarget} km/h</span>
            <span>{train?.maxSpeed || 120} km/h</span>
          </div>
        </div>
        
        <AnimatePresence>
          {nearbyAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                <h4 className="text-sm font-medium">Alert Details:</h4>
              </div>
              
              <ScrollArea className="h-32 rounded-md border p-1">
                {nearbyAlerts.map((alert) => (
                  <motion.div
                    key={alert._id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm p-2 border-l-2 border-red-500 bg-red-50 mb-1 rounded-r-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{alert.alertType.replace(/_/g, ' ')}</span>
                      <Badge variant={
                        alert.alertSeverity === 'low' ? "secondary" :
                        alert.alertSeverity === 'medium' ? "warning" : "destructive"
                      } className="text-xs">
                        {alert.alertSeverity}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {alert.camera?.railwaySection}
                    </div>
                  </motion.div>
                ))}
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AlertsMonitor;