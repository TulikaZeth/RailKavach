import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Info, Bell, Zap, Clock, Train as TrainIcon, ChevronDown } from "lucide-react";
import { Alert, Train, Camera } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AlertsPanelProps {
  alerts: Alert[];
  selectedTrain: Train | undefined;
  cameras: Camera[];
}

export default function AlertsPanel({ alerts, selectedTrain, cameras }: AlertsPanelProps) {
  const [filterByTrain, setFilterByTrain] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);
  
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
    return camera ? camera?._id : "CAM67890";
  };
  
  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case "animal_detected":
        return <AlertCircle size={18} />;
      case "animal_persistent":
        return <Bell size={18} />;
      case "train_approaching":
        return <TrainIcon size={18} />;
      case "speed_reduction":
        return <Zap size={18} />;
      case "emergency":
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Info size={18} />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 border-red-500";
      case "high":
        return "text-orange-500 border-orange-500";
      case "medium":
        return "text-yellow-500 border-yellow-500";
      case "low":
        return "text-green-500 border-green-500";
      default:
        return "text-slate-500 border-slate-500";
    }
  };
  
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "destructive";
      case "acknowledged":
        return "secondary";
      case "resolved":
        return "default";
      case "false_alarm":
        return "outline";
      default:
        return "outline";
    }
  };

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId) 
        : [...prev, alertId]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <Card className="shadow-xl border-slate-800 bg-slate-900">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5" /> Alert Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch 
              id="filter-train" 
              checked={filterByTrain} 
              onCheckedChange={setFilterByTrain}
            />
            <Label htmlFor="filter-train" className="text-sm text-slate-400">
              {selectedTrain ? `Filter for ${selectedTrain.trainId}` : "Filter by selected train"}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="space-y-3 mt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {sortedAlerts.length > 0 ? (
              sortedAlerts.map((alert) => {
                const isExpanded = expandedAlerts.includes(alert._id);
                return (
                  <motion.div 
                    key={alert._id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`border-l-4 ${getSeverityColor(alert.alertSeverity)} bg-slate-800/60 rounded-md shadow-md`}
                  >
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => toggleExpand(alert._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-full">
                            {getAlertTypeIcon(alert.alertType)}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-100">
                              {alert.alertType.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock size={12} />
                              {new Date(alert.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant={getStatusVariant(alert.status)}>
                                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1).replace("_", " ")}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Alert Status</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <ChevronDown 
                            size={16} 
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator className="bg-slate-700/50" />
                          <div className="p-3 text-sm space-y-2 text-slate-300">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-400">Camera:</span>
                              <span>{getCameraName(alert.camera)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-400">Severity:</span>
                              <span className={`capitalize ${getSeverityColor(alert.alertSeverity).split(" ")[0]}`}>
                                {alert.alertSeverity}
                              </span>
                            </div>
                            {alert.notes && (
                              <div className="pt-1">
                                <span className="font-medium text-slate-400">Notes:</span>
                                <p className="mt-1 italic text-slate-400 bg-slate-800/50 p-2 rounded">
                                  {alert.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                variants={itemVariants}
                className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-md"
              >
                <Info className="mx-auto mb-2" />
                No alerts found
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}