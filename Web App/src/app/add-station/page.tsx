'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Loader2, MapPin, Train, Save, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function AddStationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      stationCode: '',
      stationName: '',
      longitude: 0,
      latitude: 0,
      contactNumber: '',
      emergencyContact: '',
    },
  });

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post('/api/stations', {
        stationCode: data.stationCode,
        stationName: data.stationName,
        location: {
          coordinates: [data.longitude, data.latitude]
        },
        contactNumber: data.contactNumber,
        emergencyContact: data.emergencyContact
      });
      
      toast({
        title: "Station created",
        description: `${data.stationName} (${data.stationCode}) has been successfully added.`,
        className: "bg-blue-900 text-white border-blue-700"
      });
      
      router.push('/home');
    } catch (err: any) {
      console.error('Error creating station:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create station. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container py-10 mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-blue-400 hover:text-blue-300 hover:bg-blue-950 flex items-center" 
          onClick={() => router.push('/home')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <div className="mb-8 flex items-center">
          <div className="p-3 bg-blue-800 rounded-lg mr-4">
            <Train className="h-8 w-8 text-blue-200" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-200">Railway Management System</h1>
            <p className="text-slate-400">Station Administration Portal</p>
          </div>
        </div>
        
        <Card className="border-blue-900 bg-slate-800 shadow-xl shadow-blue-950/30">
          <CardHeader className="border-b border-blue-900 bg-slate-850">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900 rounded-md mr-3">
                <MapPin className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-200">Add New Station</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Create a new station in the railway network. Fill out all required details below.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-900/50 border-red-800 text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="stationCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Station Code*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. SBC" 
                            {...field} 
                            className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500" 
                          />
                        </FormControl>
                        <FormDescription className="text-slate-500">
                          Unique identifier for the station
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Station Name*</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Bangalore City Junction" 
                            {...field} 
                            className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500" 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50 mb-2">
                  <h3 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> Station Coordinates
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">Longitude*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.000001" 
                              {...field} 
                              className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200" 
                            />
                          </FormControl>
                          <FormDescription className="text-slate-500">
                            Value between -180 and 180
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">Latitude*</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.000001" 
                              {...field} 
                              className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200" 
                            />
                          </FormControl>
                          <FormDescription className="text-slate-500">
                            Value between -90 and 90
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-blue-950/50 rounded-lg border border-blue-900/50">
                  <h3 className="text-blue-300 text-sm font-medium mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">Contact Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. +91 1234567890" 
                              {...field} 
                              className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">Emergency Contact</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. +91 9876543210" 
                              {...field} 
                              className="bg-slate-900 border-blue-900 focus:border-blue-700 text-slate-200 placeholder:text-slate-500" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => router.push('/home')}
                    className="border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-blue-200"
                  >
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Station
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}