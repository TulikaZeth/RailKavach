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
import { Loader2, Train as TrainIcon, X, AlertTriangle } from 'lucide-react';
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
      });
      
      router.push('/trains');
    } catch (error) {
      console.error('Error adding train:', error);
      toast({
        title: "Error Adding Train",
        description: "There was a problem adding the train. Please try again.",
        variant: "destructive",
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-6">
          <TrainIcon className="mr-2 h-8 w-8 text-yellow-400" />
          <h1 className="text-2xl font-bold text-yellow-400">Add New Train</h1>
        </div>
        
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-700 bg-slate-800">
            <CardTitle className="text-xl text-yellow-400 flex items-center">
              <span className="bg-yellow-400 text-slate-900 rounded-full p-1 mr-2">
                <TrainIcon className="h-5 w-5" />
              </span>
              Train Information
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter the details of the new train to add it to the monitoring system
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="trainNumber" className="text-slate-300">Train Number *</Label>
                  <Input
                    id="trainNumber"
                    name="trainNumber"
                    value={formData.trainNumber}
                    onChange={handleChange}
                    required
                    className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainName" className="text-slate-300">Train Name *</Label>
                  <Input
                    id="trainName"
                    name="trainName"
                    value={formData.trainName}
                    onChange={handleChange}
                    required
                    className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Current Location (Coordinates)</Label>
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
                      className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
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
                      className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentSpeed" className="text-slate-300">Current Speed (km/h)</Label>
                  <Input
                    id="currentSpeed"
                    type="number"
                    value={formData.currentSpeed}
                    onChange={(e) => setFormData({...formData, currentSpeed: parseFloat(e.target.value)})}
                    placeholder="0"
                    className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-slate-300">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                      <SelectItem value="running" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          Running
                        </div>
                      </SelectItem>
                      <SelectItem value="stopped" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                          Stopped
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                          Maintenance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4 border border-slate-700 rounded-lg p-4 bg-slate-850">
                <div className="flex items-center text-yellow-400 mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <h3 className="font-medium">Driver Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driver.name" className="text-slate-300">Driver Name</Label>
                    <Input
                      id="driver.name"
                      name="driver.name"
                      value={formData.driver.name}
                      onChange={handleChange}
                      className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver.contactNumber" className="text-slate-300">Contact Number</Label>
                    <Input
                      id="driver.contactNumber"
                      name="driver.contactNumber"
                      value={formData.driver.contactNumber}
                      onChange={handleChange}
                      className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver.id" className="text-slate-300">Driver ID</Label>
                    <Input
                      id="driver.id"
                      name="driver.id"
                      value={formData.driver.id}
                      onChange={handleChange}
                      className="bg-slate-900 border-slate-700 text-slate-100 focus:border-yellow-400 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-slate-700 bg-slate-800 flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/trains')}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium"
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
  );
}