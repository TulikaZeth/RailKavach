"use client";
import { useState, useEffect } from "react";
import AlertsPanel from "@/components/AlertsPanel";
import { fetchDummyData } from "@/lib/api";
import { Train, Alert, Camera } from "@/types";
import TrainStatusCard from "@/components/TrainStatusCard";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleCheck, CircleAlert, CircleX, Gauge, MapPin, Train as TrainIcon } from "lucide-react";

export default function Dashboard() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("details");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_time": return "bg-green-500";
      case "delayed": return "bg-yellow-500";
      case "emergency": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on_time": return "On Time";
      case "delayed": return "Delayed";
      case "emergency": return "Emergency";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      <header className="bg-gray-800 text-white p-4 mb-8 shadow-md border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">Rail Kavach</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeAlerts.length}
              </span>
              <button className="p-2 bg-[#192332] rounded-full hover:bg-gray-600 transition-colors">
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
          
          {/* Left Column */}
          <div className="md:col-span-8">
            {/* Selected Train Details */}
            {selectedTrainData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <Card className="border-gray-700 bg-gray-800 shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrainIcon className="h-6 w-6 text-blue-400" />
                        <CardTitle className="text-xl font-semibold text-blue-400">
                          Train {selectedTrainData.trainNumber}
                        </CardTitle>
                      </div>
                      <Badge 
                        className={`${getStatusColor(selectedTrainData.status)} text-white`}
                      >
                        {getStatusText(selectedTrainData.status)}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Last updated: {new Date(selectedTrainData.currentLocation.updatedAt).toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    <Tabs 
                      defaultValue="details" 
                      value={selectedTab} 
                      onValueChange={setSelectedTab}
                      className="w-full"
                    >
                      <TabsList className="w-full bg-[#192332] border-gray-600">
                        <TabsTrigger 
                          className="data-[state=active]:bg-gray-600 data-[state=active]:text-white flex-1" 
                          value="details"
                        >
                          Details
                        </TabsTrigger>
                        <TabsTrigger 
                          className="data-[state=active]:bg-gray-600 data-[state=active]:text-white flex-1" 
                          value="speed"
                        >
                          Speed
                        </TabsTrigger>
                        <TabsTrigger 
                          className="data-[state=active]:bg-gray-600 data-[state=active]:text-white flex-1" 
                          value="location"
                        >
                          Location
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="mt-4 space-y-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#192332] p-4 rounded-lg border border-gray-600">
                              <div className="flex items-center gap-2 mb-2">
                                <CircleCheck className="h-5 w-5 text-green-400" />
                                <h3 className="text-gray-300 font-medium">Status</h3>
                              </div>
                              <p className="text-lg font-semibold text-white">{getStatusText(selectedTrainData.status)}</p>
                            </div>
                            
                            <div className="bg-[#192332] p-4 rounded-lg border border-gray-600">
                              <div className="flex items-center gap-2 mb-2">
                                <CircleAlert className="h-5 w-5 text-yellow-400" />
                                <h3 className="text-gray-300 font-medium">Active Alerts</h3>
                              </div>
                              <p className="text-lg font-semibold text-white">
                                {alerts.filter(alert => 
                                  alert.status === "active" 
                                ).length}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="speed" className="mt-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-[#192332] p-4 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Gauge className="h-5 w-5 text-blue-400" />
                            <h3 className="text-gray-300 font-medium">Current Speed</h3>
                          </div>
                          
                          <div className="flex items-end gap-2 mb-4">
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5 }}
                              className="text-3xl font-bold text-white"
                            >
                              {Math.round(selectedTrainData.currentSpeed)}
                            </motion.div>
                            <div className="text-lg text-gray-400">km/h</div>
                          </div>
                          
                          <div className="w-full bg-gray-800 rounded-full h-4 mb-2 border border-gray-600 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${Math.min(100, (selectedTrainData.currentSpeed / 120) * 100)}%` 
                              }}
                              transition={{ duration: 0.5 }}
                              className="bg-blue-600 h-full rounded-full"
                            ></motion.div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0 km/h</span>
                            <span>120 km/h</span>
                          </div>
                        </motion.div>
                      </TabsContent>
                      
                      <TabsContent value="location" className="mt-4">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="bg-[#192332] p-4 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-red-400" />
                            <h3 className="text-gray-300 font-medium">GPS Coordinates</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                              <span className="text-gray-400">Latitude</span>
                              <span className="text-white font-mono">
                                {selectedTrainData.currentLocation.coordinates[1].toFixed(6)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                              <span className="text-gray-400">Longitude</span>
                              <span className="text-white font-mono">
                                {selectedTrainData.currentLocation.coordinates[0].toFixed(6)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                              <span className="text-gray-400">Last Updated</span>
                              <span className="text-white">
                                {new Date(selectedTrainData.currentLocation.updatedAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                <CardFooter className="pt-4 pb-2 border-t border-gray-700">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <TrainIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Train Management System</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Full Details
                      </motion.button>
                    </div>
                  </CardFooter>
              </motion.div>
            )}
            
            {/* Alerts Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-gray-700 bg-gray-800 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-blue-400">Alert Dashboard</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitoring {alerts.length} alerts across {trains.length} trains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertsPanel 
                    alerts={alerts} 
                    selectedTrain={selectedTrainData} 
                    cameras={cameras} 
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Right Column */}
          <div className="md:col-span-4">
            {/* Train Status Card */}
            {selectedTrainData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <TrainStatusCard alerts={alerts} train={selectedTrainData} />
              </motion.div>
            )}
            
            {/* Alert Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6"
            >
              <Card className="border-gray-700 bg-gray-800 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-blue-400">Alert Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="bg-red-900/30 p-4 rounded-lg border border-red-800"
                    >
                      <div className="text-red-400 text-2xl font-bold">
                        {alerts.filter(a => a.status === "active").length}
                      </div>
                      <div className="text-red-300 text-sm">Active Alerts</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-800"
                    >
                      <div className="text-yellow-400 text-2xl font-bold">
                        {alerts.filter(a => a.status === "acknowledged").length}
                      </div>
                      <div className="text-yellow-300 text-sm">Acknowledged</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="bg-green-900/30 p-4 rounded-lg border border-green-800"
                    >
                      <div className="text-green-400 text-2xl font-bold">
                        {alerts.filter(a => a.status === "resolved").length}
                      </div>
                      <div className="text-green-300 text-sm">Resolved</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.03 }}
                      className="bg-[#192332] p-4 rounded-lg border border-gray-600"
                    >
                      <div className="text-gray-300 text-2xl font-bold">
                        {alerts.filter(a => a.status === "false_alarm").length}
                      </div>
                      <div className="text-gray-400 text-sm">False Alarms</div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Camera Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6"
            >
              <Card className="border-gray-700 bg-gray-800 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-blue-400">Camera Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700"
                  >
                    <div className="text-gray-300">Total Cameras</div>
                    <div className="font-bold text-white">{cameras.length}</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700"
                  >
                    <div className="text-gray-300 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      Online
                    </div>
                    <div className="font-bold text-green-400">
                      {cameras.filter(c => c.status === "online").length || 1}
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700"
                  >
                    <div className="text-gray-300 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      Offline
                    </div>
                    <div className="font-bold text-red-400">
                      {cameras.filter(c => c.status === "offline").length}
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex justify-between items-center"
                  >
                    <div className="text-gray-300 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      Maintenance
                    </div>
                    <div className="font-bold text-yellow-400">
                      {cameras.filter(c => c.status === "maintenance").length}
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}