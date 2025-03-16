import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Train, Camera } from '@/models/schema';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');
    const cameraId = searchParams.get('cameraId');
    
    if (!trainId || !cameraId) {
      return NextResponse.json(
        { error: 'Both trainId and cameraId parameters are required' }, 
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const train = await Train.findById(trainId);
    const camera = await Camera.findById(cameraId);
    
    if (!train || !camera) {
      return NextResponse.json(
        { error: 'Train or camera not found' }, 
        { status: 404 }
      );
    }
    
    // Calculate the distance between train and camera using Haversine formula
    const trainCoords = train.currentLocation.coordinates;
    const cameraCoords = camera.location.coordinates;
    
    // Function to calculate distance using Haversine formula
    function calculateHaversineDistance(lon1: number, lat1: number, lon2: number, lat2: number) {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      return distance;
    }
    
    const distanceKm = calculateHaversineDistance(
      trainCoords[0], trainCoords[1],
      cameraCoords[0], cameraCoords[1]
    );
    
    // Estimate arrival time (simple calculation based on current speed)
    const currentSpeed = train.currentSpeed || 60; // Default to 60 km/h if no speed available
    const estimatedArrivalMinutes = (distanceKm / currentSpeed) * 60;
    
    return NextResponse.json({
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      estimatedArrivalMinutes: Math.round(estimatedArrivalMinutes)
    }, { status: 200 });
  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json({ error: 'Failed to calculate distance' }, { status: 500 });
  }
}
