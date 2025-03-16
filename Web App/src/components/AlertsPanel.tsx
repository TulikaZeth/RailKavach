import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, Train, Camera } from "@/types";

interface AlertsPanelProps {
  alerts: Alert[];
  selectedTrain: Train | undefined;
  cameras: Camera[];
}

export default function AlertsPanel({ alerts, selectedTrain, cameras }: AlertsPanelProps) {
  const [filterByTrain, setFilterByTrain] = useState(false);
  
  const filteredAlerts = filterByTrain && selectedTrain 
    ? alerts.filter(alert => alert.affectedTrains.includes(selectedTrain._id))
    : alerts;
  
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Sort by severity (critical first)
    const severityOrder = { "critical": 0, "high": 1, "medium": 2, "low": 3 };
    if (severityOrder[a.alertSeverity] !== severityOrder[b.alertSeverity]) {
      return severityOrder[a.alertSeverity] - severityOrder[b.alertSeverity];
    }
    
    // Then by status (active first)
    const statusOrder = { "active": 0, "acknowledged": 1, "resolved": 2, "false_alarm": 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then by time (newer first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const getCameraName = (cameraId: string) => {
    const camera = cameras.find(cam => cam._id === cameraId);
    return camera ? camera.cameraId : "Unknown Camera";
  };
  
  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case "animal_detected":
        return "🐘";
      case "animal_persistent":
        return "⚠️";
      case "train_approaching":
        return "🚂";
      case "speed_reduction":
        return "🔽";
      case "emergency":
        return "🚨";
      default:
        return "📢";
    }
  };
  
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900 border-red-700";
      case "high":
        return "bg-orange-900 border-orange-700";
      case "medium":
        return "bg-yellow-900 border-yellow-700";
      case "low":
        return "bg-green-900 border-green-700";
      default:
        return "bg-gray-800 border-gray-600";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-600";
      case "acknowledged":
        return "bg-yellow-600";
      case "resolved":
        return "bg-green-600";
      case "false_alarm":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };
  
  return (
    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-100">Alert Notifications</h2>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            checked={filterByTrain} 
            onChange={() => setFilterByTrain(!filterByTrain)}
            className="mr-2"
          />
          <span className="text-sm text-gray-300">
            Show only alerts for selected train
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {sortedAlerts.length > 0 ? (
            sortedAlerts.map((alert) => (
              <motion.div 
                key={alert._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`border-l-4 ${getAlertColor(alert.alertSeverity)} bg-gray-800 rounded p-3`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getAlertTypeIcon(alert.alertType)}</span>
                    <div>
                      <h3 className="font-semibold text-white">
                        {alert.alertType.replace("_", " ").charAt(0).toUpperCase() + alert.alertType.replace("_", " ").slice(1)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {getCameraName(alert.camera)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(alert.status)}`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3 text-sm text-gray-300">
                  <p className="mb-1">
                    Severity: {alert.alertSeverity.charAt(0).toUpperCase() + alert.alertSeverity.slice(1)}
                  </p>
                  <p>
                    Time: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                  {alert.notes && (
                    <p className="mt-2 italic text-gray-400">
                      "{alert.notes}"
                    </p>
                  )}
                </div>
                
              
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No alerts found
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}