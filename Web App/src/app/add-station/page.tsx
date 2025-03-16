'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Loader2, MapPin, Train, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

// Form schema validation



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
      
      toast
      ({
        title: "Station created",
        description: `${data.stationName} (${data.stationCode}) has been successfully added.`
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
    <div className="container py-10 mx-auto max-w-3xl">
      <div className="mb-8 flex items-center">
        <Train className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Railway Management System</h1>
      </div>
      
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-primary" />
            Add New Station
          </CardTitle>
          <CardDescription>
            Create a new station in the railway network. Fill out all required details below.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
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
                      <FormLabel>Station Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. SBC" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the station
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Station Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bangalore City Junction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Value between -180 and 180
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Value between -90 and 90
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +91 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => router.push('/home')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-primary hover:bg-primary/80"
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
  );
}