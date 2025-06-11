'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, Train as TrainIcon, X,  ChevronLeft, User, MapPin, Gauge } from 'lucide-react';
import { toast } from 'sonner';

interface DriverInfo {
  name: string;
  contactNumber: string;
  id: string;
}

interface TrainData {
  trainNumber: string;
  trainName: string;
  currentLocation: {
    type: string;
    coordinates: number[];
  };
  currentSpeed: number;
  status: 'running' | 'stopped' | 'maintenance';
  driver: DriverInfo;
}

export default function AddTrainPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TrainData>({
    trainNumber: '',
    trainName: '',
    currentLocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    currentSpeed: 0,
    status: 'stopped',
    driver: {
      name: '',
      contactNumber: '',
      id: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof TrainData],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseFloat(e.target.value);
    
    setFormData(prev => ({
      ...prev,
      currentLocation: {
        ...prev.currentLocation,
        coordinates: prev.currentLocation.coordinates.map((coord, i) => 
          i === index ? value : coord
        )
      }
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'running' | 'stopped' | 'maintenance'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/trains', formData);
      
      toast({
        title: "Train Added Successfully",
        description: `Train ${formData.trainName} has been added to the system.`,
        className: "bg-blue-900 text-white border-blue-700"
      });
      
      router.push('/trains');
    } catch (error) {
      console.error('Error adding train:', error);
      toast({
        title: "Error Adding Train",
        description: "There was a problem adding the train. Please try again.",
        variant: "destructive",
        className: "bg-red-900 text-white border-red-700"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500';
      case 'stopped': return 'bg-red-500';
      case 'maintenance': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container py-10 mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-blue-400 hover:text-blue-300 hover:bg-blue-950 flex items-center" 
          onClick={() => router.push('/trains')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Train Management
        </Button>
        
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8 flex items-center">
            <div className="p-3 bg-blue-800 rounded-lg mr-4">
              <TrainIcon className="h-8 w-8 text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-blue-200">Railway Management System</h1>
              <p className="text-slate-400">Train Registration Portal</p>
            </div>
          </div>
          
          <Card className="border-blue-900 bg-slate-800 shadow-xl shadow-blue-950/30">
            <CardHeader className="border-b border-blue-900 bg-slate-850">
              <div className="flex items-center">
                <div className="p-2 bg-blue-900 rounded-md mr-3">
                  <TrainIcon className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-blue-200">Add New Train</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Enter the details of the new train to add it to the monitoring system
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="pt-6 space-y-6">
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50 mb-2">
                  <h3 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <TrainIcon className="h-4 w-4 mr-1" /> Basic Train Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="trainNumber" className="text-blue-200">Train Number *</Label>
                      <Input
                        id="trainNumber"
                        name="trainNumber"
                        value={formData.trainNumber}
                        onChange={handleChange}
                        required
                        className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                      />
                      <p className="text-xs text-slate-500">Unique identifier for the train</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trainName" className="text-blue-200">Train Name *</Label>
                      <Input
                        id="trainName"
                        name="trainName"
                        value={formData.trainName}
                        onChange={handleChange}
                        required
                        className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                      />
                      <p className="text-xs text-slate-500">Display name for the train</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50 mb-2">
                  <h3 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> Location & Status
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-blue-200 mb-2 block">Current Location (Coordinates)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="longitude" className="text-slate-400 text-sm">Longitude</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.000001"
                            value={formData.currentLocation.coordinates[0]}
                            onChange={(e) => handleLocationChange(e, 0)}
                            placeholder="0.000000"
                            className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="latitude" className="text-slate-400 text-sm">Latitude</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.000001"
                            value={formData.currentLocation.coordinates[1]}
                            onChange={(e) => handleLocationChange(e, 1)}
                            placeholder="0.000000"
                            className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentSpeed" className="text-blue-200 flex items-center">
                          <Gauge className="h-4 w-4 mr-1" /> Current Speed (km/h)
                        </Label>
                        <Input
                          id="currentSpeed"
                          type="number"
                          value={formData.currentSpeed}
                          onChange={(e) => setFormData({...formData, currentSpeed: parseFloat(e.target.value)})}
                          placeholder="0"
                          className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-blue-200">Current Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-blue-900 text-slate-200">
                            <SelectItem value="running" className="hover:bg-blue-900 focus:bg-blue-900">
                              <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                                Running
                              </div>
                            </SelectItem>
                            <SelectItem value="stopped" className="hover:bg-blue-900 focus:bg-blue-900">
                              <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                                Stopped
                              </div>
                            </SelectItem>
                            <SelectItem value="maintenance" className="hover:bg-blue-900 focus:bg-blue-900">
                              <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                                Maintenance
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="mt-2 flex items-center">
                          <span className={`h-3 w-3 rounded-full ${getStatusColor(formData.status)} mr-2`}></span>
                          <span className="text-xs text-slate-400">
                            Current selection: {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50">
                  <h3 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <User className="h-4 w-4 mr-1" /> Driver Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driver.name" className="text-blue-200">Driver Name</Label>
                      <Input
                        id="driver.name"
                        name="driver.name"
                        value={formData.driver.name}
                        onChange={handleChange}
                        className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver.contactNumber" className="text-blue-200">Contact Number</Label>
                      <Input
                        id="driver.contactNumber"
                        name="driver.contactNumber"
                        value={formData.driver.contactNumber}
                        onChange={handleChange}
                        className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                        placeholder="+91 1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver.id" className="text-blue-200">Driver ID</Label>
                      <Input
                        id="driver.id"
                        name="driver.id"
                        value={formData.driver.id}
                        onChange={handleChange}
                        className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500"
                        placeholder="DRV-12345"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-blue-900 bg-slate-850 flex justify-between py-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.push('/trains')}
                  className="border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-blue-200"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <TrainIcon className="mr-2 h-4 w-4" />
                      Add Train
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}