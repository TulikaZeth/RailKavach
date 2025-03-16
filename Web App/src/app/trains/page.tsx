'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Train as TrainIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  BadgeAlert,
  Gauge,
  MapPin
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Train type definition based on schema
type TrainDriver = {
  name: string;
  contactNumber: string;
  id: string;
};

type Train = {
  _id: string;
  trainNumber: string;
  trainName: string;
  currentLocation: {
    type: string;
    coordinates: [number, number];
    updatedAt: string;
  };
  currentSpeed: number;
  status: 'running' | 'stopped' | 'maintenance';
  driver: TrainDriver;
  createdAt: string;
  updatedAt: string;
};

export default function TrainsManagement() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch trains data
  const fetchTrains = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/trains');
      setTrains(response.data.data);
      setFilteredTrains(response.data.data);
    } catch (error) {
      console.error('Failed to fetch trains:', error);
      toast({
        message: "Failed to load trains data. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch train details
  const fetchTrainDetails = async (trainId: string) => {
    try {
      const response = await axios.get(`/api/trains/${trainId}`);
      setSelectedTrain(response.data);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Failed to fetch train details:', error);
      toast({
        title: "Error",
        description: "Failed to load train details.",
        variant: "destructive"
      });
    }
  };

  // Apply filters
  useEffect(() => {
    let results = trains;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(train => 
        train.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (train.driver?.name && train.driver.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(train => train.status === statusFilter);
    }
    
    setFilteredTrains(results);
  }, [searchTerm, statusFilter, trains]);

  // Fetch trains on component mount
  useEffect(() => {
    fetchTrains();
  }, []);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-600 hover:bg-green-700';
      case 'stopped': return 'bg-amber-600 hover:bg-amber-700';
      case 'maintenance': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'stopped': return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'maintenance': return <BadgeAlert className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container py-10 mx-auto">
      <div className="mb-8 flex items-center">
        <TrainIcon className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Railway Management System</h1>
      </div>
      
      <Card className="border-border bg-card mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Gauge className="h-6 w-6 mr-2 text-primary" />
            Active Trains Monitor
          </CardTitle>
          <CardDescription>
            View and monitor all trains in the railway network in real-time.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trains by number, name, or driver..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={fetchTrains}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No trains found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No trains are currently registered in the system'}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Train Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Driver</TableHead>
                    <TableHead className="hidden lg:table-cell">Speed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrains.map((train) => (
                    <TableRow key={train._id}>
                      <TableCell className="font-medium">{train.trainNumber}</TableCell>
                      <TableCell>{train.trainName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {train.driver?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {train.currentSpeed} km/h
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(train.status)} text-white`}>
                          {getStatusIcon(train.status)}
                          {train.status.charAt(0).toUpperCase() + train.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(train.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fetchTrainDetails(train._id)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Train details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <TrainIcon className="h-5 w-5 mr-2" />
              Train Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the selected train.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrain && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTrain.trainName}</h3>
                  <p className="text-sm text-muted-foreground">#{selectedTrain.trainNumber}</p>
                </div>
                <Badge className={`${getStatusColor(selectedTrain.status)} text-white`}>
                  {getStatusIcon(selectedTrain.status)}
                  {selectedTrain.status.charAt(0).toUpperCase() + selectedTrain.status.slice(1)}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Current Speed</p>
                  <p className="font-medium">{selectedTrain.currentSpeed} km/h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(selectedTrain.updatedAt)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Location</p>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  <p className="font-medium">
                    {selectedTrain.currentLocation?.coordinates[1].toFixed(6)}, {selectedTrain.currentLocation?.coordinates[0].toFixed(6)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last location update: {formatDate(selectedTrain.currentLocation?.updatedAt || selectedTrain.updatedAt)}
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Driver Information</p>
                {selectedTrain.driver ? (
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="font-medium">{selectedTrain.driver.name}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                      <p>ID: {selectedTrain.driver.id}</p>
                      <p>Contact: {selectedTrain.driver.contactNumber}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No driver assigned</p>
                )}
              </div>
              
              <DialogFooter>
                <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}