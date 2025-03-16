import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Train } from '@/models/schema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const train = await Train.findById(params.id);
    
    if (!train) {
      return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      coordinates: train.currentLocation.coordinates,
      updatedAt: train.currentLocation.updatedAt
    }, { status: 200 });
  } catch (error) {
    console.error(`Error fetching location for train ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch train location' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { coordinates } = await request.json();
    await connectToDatabase();
    
    const updatedTrain = await Train.findByIdAndUpdate(
      params.id,
      { 
        $set: {
          'currentLocation.coordinates': coordinates,
          'currentLocation.updatedAt': new Date()
        } 
      },
      { new: true }
    );
    
    if (!updatedTrain) {
      return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      coordinates: updatedTrain.currentLocation.coordinates,
      updatedAt: updatedTrain.currentLocation.updatedAt
    }, { status: 200 });
  } catch (error) {
    console.error(`Error updating location for train ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update train location' }, { status: 500 });
  }
}

