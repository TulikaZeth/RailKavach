import React, { useEffect, useState } from "react";
import { Alert, TrainData } from "@/app/dashboard/page";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
      onSlowDown(40);
      setMonitorStatus("slowing");
    } else {
      // Other alerts - slow to 60km/h
      toast({
        title: "Alert Detected",
        description: "Alert detected near tracks. Train speed reduced to 60km/h.",
        duration: 5000,
      });
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
      onResume();
      setMonitorStatus("monitoring");
    }
  };

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
    <div className="border rounded-md p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
          Safety Monitor
        </h3>
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${
            monitorStatus === "idle" ? "bg-gray-400" :
            monitorStatus === "monitoring" ? "bg-green-500" :
            monitorStatus === "slowing" ? "bg-yellow-500" :
            "bg-red-500"
          }`}></span>
          <span className="text-sm text-gray-600">{
            monitorStatus === "idle" ? "Standby" :
            monitorStatus === "monitoring" ? "Active" :
            monitorStatus === "slowing" ? "Speed Reduction" :
            "Emergency Stop"
          }</span>
        </div>
      </div>
      
      <div className="text-sm mb-2">
        <span className="text-gray-500">Last check: </span>
        <span className="font-medium">{lastFetchTime || "Never"}</span>
      </div>
      
      <div className="mb-3">
        <span className="text-sm text-gray-500">Nearby alerts: </span>
        <span className={`font-bold ${nearbyAlerts.length > 0 ? "text-red-500" : "text-green-500"}`}>
          {nearbyAlerts.length}
        </span>
      </div>
      
      {nearbyAlerts.length > 0 && (
        <div className="mt-2 space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
            Alert Details:
          </h4>
          <div className="max-h-32 overflow-y-auto">
            {nearbyAlerts.map((alert) => (
              <div key={alert._id} className="text-sm p-2 border-l-2 border-red-500 bg-red-50 mb-1">
                <div className="flex justify-between">
                  <span className="font-medium">{alert.alertType.replace('_', ' ')}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    alert.alertSeverity === 'low' ? 'bg-blue-100 text-blue-800' :
                    alert.alertSeverity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {alert.alertSeverity}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {alert.camera?.railwaySection}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsMonitor;