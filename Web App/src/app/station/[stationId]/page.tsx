'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { MapPin, Train, Camera, AlertTriangle, MoreHorizontal, ExternalLink, Bell, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Interfaces
interface Camera {
  _id: string;
  cameraId: string;
  location: {
    type: string;
    coordinates: number[];
  };
  railwaySection: string;
  status: string;
  nearestStation: string;
}

interface Alert {
  _id: string;
  eventId: {
    _id: string;
    animalType: string;
    confidence: number;
    imageUrl: string;
  };
  camera: {
    _id: string;
    cameraId: string;
    railwaySection: string;
  };
  alertType: string;
  alertSeverity: string;
  status: string;
  createdAt: string;
  notifiedStations: any[];
}

interface Station {
  _id: string;
  stationCode: string;
  stationName: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

// Sub-components
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#121212] text-gray-200">
    <header className="bg-[#121212] text-white px-6 py-4 shadow-md border-b border-blue-800 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="bg-blue-800 p-2 rounded-lg">
          <Train className="h-6 w-6 text-blue-200" />
        </div>
        <div>
          <Skeleton className="h-8 w-64 bg-gray-700" />
          <Skeleton className="h-4 w-32 bg-gray-700 mt-1" />
        </div>
      </div>
      <div className="hidden md:flex items-center bg-blue-800 px-3 py-1 rounded-full text-sm">
        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
        <span>Online</span>
      </div>
    </header>
    <main className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48 bg-gray-700" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 w-full bg-gray-700" />
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48 bg-gray-700" /></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24 w-full bg-gray-700" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-[#121212] text-gray-200">
    <header className="bg-[#121212] text-white px-6 py-4 shadow-md border-b border-blue-800 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="bg-blue-800 p-2 rounded-lg">
          <Train className="h-6 w-6 text-blue-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
      </div>
    </header>
    <main className="p-6">
      <Card className="bg-red-900/30 border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </main>
  </div>
);

const AlertCard = ({ alert, resolveAlert }: { alert: Alert; resolveAlert: (alertId: string) => void }) => {
  const styles = getAlertSeverityStyles(alert.alertSeverity);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`${styles.cardBg} transition-all border ${styles.border} hover:shadow-lg`}>
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg font-medium flex items-center text-white">
              <Badge className={styles.badge} variant="default">
                {alert.alertSeverity.toUpperCase()}
              </Badge>
              <span className="ml-2">
                {alert.alertType.replace('_', ' ').toUpperCase()}
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300 mt-1">
              Camera: {alert.camera?.cameraId || "Unknown"} • {new Date(alert.createdAt).toLocaleString()}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-green-800/80 hover:bg-green-700 text-white border-green-700 transition-colors"
                  onClick={() => resolveAlert(alert._id)}
                >
                  Resolve
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mark this alert as resolved</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="px-4 py-2">
          {alert.eventId?.animalType && (
            <p className="text-sm text-gray-200 mb-2">
              Animal detected: <span className="font-medium">{alert.eventId.animalType.replace('_', ' ')}</span> 
              <Badge variant="outline" className="ml-1 text-white bg-blue-900/50 border-blue-700">
                {Math.round(alert.eventId.confidence * 100) / 100}% confidence
              </Badge>
            </p>
          )}
          {alert.eventId?.imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-md overflow-hidden shadow-lg border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* <img 
                src={alert.eventId.imageUrl} 
                alt="Detection image" 
                className="h-44 w-full object-cover hover:scale-105 transition-transform duration-300"
              /> */}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CameraCard = ({ camera }: { camera: Camera }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
    <Card className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base text-white font-medium flex items-center justify-between">
          <span>{camera.cameraId}</span>
          <Badge variant="outline" className={getCameraStatusStyles(camera.status)}>
            {camera.status}
          </Badge>
        </CardTitle>
        <CardDescription className="text-gray-300">
          Section: {camera.railwaySection}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-300 mb-3">
          Coordinates: {camera.location.coordinates.join(', ')}
        </p>
        <Button 
          className="w-full bg-blue-700 hover:bg-blue-600 text-white" 
          size="sm"
          onClick={() => window.open(`/detection`, '_blank')}
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          View Feed
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

// Main Component
export default function StationDashboard() {
  const params = useParams();
  const stationId = params.stationId as string;
  
  const [station, setStation] = useState<Station | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<Alert[]>([]);
  const [nearbyCameras, setNearbyCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStationData = async () => {
      try {
        setLoading(true);
        
        const stationResponse = await axios.get(`/api/stations/${stationId}`);
        setStation(stationResponse.data);
        
        const alertsResponse = await axios.get('/api/alerts');
        const relevantAlerts = alertsResponse.data.filter(
          (alert: Alert) => alert.notifiedStations.some((s: any) => s._id === stationId) && alert.status === 'active'
        );
        setNearbyAlerts(relevantAlerts);
        
        const camerasResponse = await axios.get('/api/cameras');
        const stationCameras = camerasResponse.data.filter(
          (camera: Camera) => camera.nearestStation._id.toString() === stationId
        );
        setNearbyCameras(stationCameras);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStationData();
  }, [stationId]);
  
  const resolveAlert = async (alertId: string) => {
    try {
      await axios.put(`/api/alerts/${alertId}`, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        acknowledgedBy: {
          userId: 'station-user',
          userName: 'Station Personnel',
          timestamp: new Date().toISOString()
        }
      });
      
      setNearbyAlerts(prevAlerts => prevAlerts.filter(alert => alert._id !== alertId));
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError('Failed to resolve alert. Please try again.');
    }
  };
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      <header className="bg-[#121212] text-white px-6 py-4 shadow-md border-b border-blue-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-800 p-2 rounded-lg">
            <Train className="h-6 w-6 text-blue-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              {station?.stationName} 
              <span className="ml-2 text-lg bg-blue-800 px-2 py-0.5 rounded text-blue-100">
                {station?.stationCode}
              </span>
            </h1>
            <div className="flex items-center text-blue-200 text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Station Dashboard</span>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center bg-blue-800 px-3 py-1 rounded-full text-sm">
          <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
          <span>Online</span>
        </div>
      </header>
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-gray-900/60 backdrop-blur-sm flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center text-white">
                  <Bell className="mr-2 h-5 w-5 text-red-400" />
                  Active Alerts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {nearbyAlerts.length} {nearbyAlerts.length === 1 ? "alert" : "alerts"} requiring attention
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-300">
                {new Date().toLocaleDateString()}
              </Badge>
            </CardHeader>
            <Separator className="bg-gray-800" />
            <CardContent className="pt-6 pb-4">
              {nearbyAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="rounded-full bg-green-900/20 p-4 mb-4 border border-green-800/50">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-gray-300 font-medium text-lg">No active alerts at this time</p>
                  <p className="text-gray-500 mt-2">The system is monitoring for new events</p>
                </motion.div>
              ) : (
                <motion.div className="space-y-4">
                  {nearbyAlerts.map((alert) => (
                    <AlertCard key={alert._id} alert={alert} resolveAlert={resolveAlert} />
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl text-white font-semibold flex items-center">
                  <Camera className="mr-2 h-5 w-5 text-blue-400" />
                  Nearby Cameras
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {nearbyCameras.length} {nearbyCameras.length === 1 ? 'camera' : 'cameras'} in proximity
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-gray-700 text-white border-gray-600 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    View All Cameras
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    Filter by Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <Separator className="bg-gray-700" />
            <CardContent className="pt-6">
              {nearbyCameras.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-blue-900/20 p-3 mb-4">
                    <Camera className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-gray-400 font-medium">No cameras found near this station.</p>
                  <p className="text-gray-500 text-sm mt-1">Install cameras to monitor railway sections.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nearbyCameras.map((camera) => (
                    <CameraCard key={camera._id} camera={camera} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Utility functions
const getAlertSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { 
        cardBg: 'bg-red-950/40 hover:bg-red-950/60', 
        border: 'border-red-700',
        badge: 'bg-red-700 hover:bg-red-600 text-white'
      };
    case 'high':
      return { 
        cardBg: 'bg-orange-950/40 hover:bg-orange-950/60', 
        border: 'border-orange-700',
        badge: 'bg-orange-600 hover:bg-orange-500 text-white'
      };
    case 'medium':
      return { 
        cardBg: 'bg-yellow-950/40 hover:bg-yellow-950/60', 
        border: 'border-yellow-700',
        badge: 'bg-yellow-600 hover:bg-yellow-500 text-white'
      };
    default:
      return { 
        cardBg: 'bg-blue-950/40 hover:bg-blue-950/60', 
        border: 'border-blue-700',
        badge: 'bg-blue-600 hover:bg-blue-500 text-white'
      };
  }
};

const getCameraStatusStyles = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-600 hover:bg-green-500 text-white';
    case 'inactive':
      return 'bg-red-600 hover:bg-red-500 text-white';
    default:
      return 'bg-yellow-600 hover:bg-yellow-500 text-white';
  }
};