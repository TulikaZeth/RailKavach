'use client';
import { useState, useEffect } from 'react';
import { 
  Train as TrainIcon, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  BadgeAlert,
  Gauge,
  MapPin,
  HardDrive,
  Phone
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
import { Toaster } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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

const HARDCODED_TRAINS: Train[] = [
  {
    _id: '1',
    trainNumber: 'T123',
    trainName: 'Shatabdi Express',
    currentLocation: {
      type: 'Point',
      coordinates: [28.6139, 77.2090], // Delhi
      updatedAt: new Date().toISOString()
    },
    currentSpeed: 120,
    status: 'running',
    driver: {
      name: 'Rajesh Kumar',
      contactNumber: '+91 98765 43210',
      id: 'DRV001'
    },
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    trainNumber: 'T456',
    trainName: 'Mumbai Local',
    currentLocation: {
      type: 'Point',
      coordinates: [19.0760, 72.8777], // Mumbai
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    currentSpeed: 0,
    status: 'stopped',
    driver: {
      name: 'Sneha Patil',
      contactNumber: '+91 99887 66554',
      id: 'DRV002'
    },
    createdAt: new Date('2023-02-20').toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },

  {
    _id: '4',
    trainNumber: 'T101',
    trainName: 'Gomti Superfast',
    currentLocation: {
      type: 'Point',
      coordinates: [13.0827, 80.2707], // Chennai
      updatedAt: new Date(Date.now() - 1800000).toISOString()
    },
    currentSpeed: 15,
    status: 'running',
    driver: {
      name: 'Vikram Singh',
      contactNumber: '+91 90123 45678',
      id: 'DRV004'
    },
    createdAt: new Date('2023-04-05').toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  }
];


export default function TrainsManagement() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTrains(HARDCODED_TRAINS);
      setFilteredTrains(HARDCODED_TRAINS);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Apply filters
  useEffect(() => {
    let results = [...HARDCODED_TRAINS];
    
    if (searchTerm) {
      results = results.filter(train => 
        train.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        train.driver.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(train => train.status === statusFilter);
    }
    
    setFilteredTrains(results);
  }, [searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'stopped': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'maintenance': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle2 className="h-4 w-4" />;
      case 'stopped': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <BadgeAlert className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-8 py-10 mx-auto bg-gray-950 text-gray-100 min-h-screen">
      <Toaster theme="dark" position="top-right" />
      
      <div className="mb-8 flex items-center">
        <TrainIcon className="h-8 w-8 mr-3 text-blue-400" />
        <h1 className="text-3xl font-bold text-blue-400">Railway Management System</h1>
      </div>
      
      <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm mb-6 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center text-gray-100">
                <Gauge className="h-6 w-6 mr-2 text-blue-400" />
                Active Trains Monitor
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and monitor all trains in the railway network
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-gray-400 border-gray-700">
              {filteredTrains.length} {filteredTrains.length === 1 ? 'train' : 'trains'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trains by number, name, or driver..."
                className="pl-8 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700 text-gray-100">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-gray-100 border-gray-700">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className="bg-gray-800/50 border-gray-700 text-gray-100 hover:text-blue-400 hover:border-blue-400"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-800 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px] bg-gray-800" />
                    <Skeleton className="h-4 w-[150px] bg-gray-800" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filteredTrains.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-800 rounded-lg">
              <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-100">No trains found</h3>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No trains are currently registered in the system'}
              </p>
              <Button 
                variant="ghost" 
                className="mt-4 text-blue-400"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-800/50">
                  <TableRow className="border-b border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-300 w-[120px]">Train Number</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300 hidden md:table-cell">Driver</TableHead>
                    <TableHead className="text-gray-300 hidden lg:table-cell">Speed</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300 hidden md:table-cell">Last Updated</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrains.map((train) => (
                    <TableRow key={train._id} className="border-b border-gray-800 hover:bg-gray-800/20">
                      <TableCell className="font-medium text-gray-100">
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md text-xs font-mono">
                          {train.trainNumber}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-100 font-medium">{train.trainName}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-300">
                        {train.driver.name}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-gray-300">
                        <div className="flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                            train.currentSpeed > 80 ? 'bg-green-500' : 
                            train.currentSpeed > 30 ? 'bg-amber-500' : 'bg-gray-500'
                          }`} />
                          {train.currentSpeed} km/h
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(train.status)} flex items-center gap-1`}>
                          {getStatusIcon(train.status)}
                          {train.status.charAt(0).toUpperCase() + train.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-300 text-sm">
                        {formatDate(train.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTrain(train);
                            setIsDetailsOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 hover:bg-gray-800/50"
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
        <DialogContent className="sm:max-w-lg bg-gray-900 text-gray-100 border border-gray-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-gray-100">
              <TrainIcon className="h-5 w-5 mr-2 text-blue-400" />
              Train Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about the selected train
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrain && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">{selectedTrain.trainName}</h3>
                  <p className="text-sm text-gray-400">#{selectedTrain.trainNumber}</p>
                </div>
                <Badge variant="outline" className={`${getStatusColor(selectedTrain.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedTrain.status)}
                  {selectedTrain.status.charAt(0).toUpperCase() + selectedTrain.status.slice(1)}
                </Badge>
              </div>
              
              <Separator className="bg-gray-800" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Current Speed</p>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      selectedTrain.currentSpeed > 80 ? 'bg-green-500' : 
                      selectedTrain.currentSpeed > 30 ? 'bg-amber-500' : 'bg-gray-500'
                    }`} />
                    <p className="font-medium text-gray-100 text-xl">
                      {selectedTrain.currentSpeed} <span className="text-sm text-gray-400">km/h</span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-100">
                    {formatDate(selectedTrain.updatedAt)}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-800/30 p-3 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Current Location</p>
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                  <p className="font-mono text-gray-100">
                    {selectedTrain.currentLocation.coordinates[1].toFixed(6)}, {selectedTrain.currentLocation.coordinates[0].toFixed(6)}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Last update: {formatDate(selectedTrain.currentLocation.updatedAt)}
                </p>
              </div>
              
              <Separator className="bg-gray-800" />
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Driver Information</p>
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-100">{selectedTrain.driver.name}</p>
                      <p className="text-sm text-gray-400">ID: {selectedTrain.driver.id}</p>
                    </div>
                    <a href={`tel:${selectedTrain.driver.contactNumber.replace(/\D/g, '')}`}>
                      <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </a>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-400">Contact:</span> {selectedTrain.driver.contactNumber}
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => setIsDetailsOpen(false)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}