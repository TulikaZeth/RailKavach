// src/app/api/admin/initialize-tracking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateAllTrains } from '@/services/trainTrackingService';
import { Train } from '@/models/schema';
import connectToDatabase from '@/lib/db';

// Simple API key validation
const validateApiKey = (request: NextRequest): boolean => {
  const apiKey = process.env.ADMIN_API_KEY;
  const authHeader = request.headers.get('x-api-key');
  
  if (!apiKey || !authHeader) {
    return false;
  }
  
  return authHeader === apiKey;
};

export async function POST(request: NextRequest) {
  // Validate admin API key
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { trainNumbers } = body;
    
    if (!trainNumbers || !Array.isArray(trainNumbers)) {
      return NextResponse.json(
        { error: 'Invalid request. trainNumbers array required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Create or update trains in database
    const results = [];
    
    for (const trainNumber of trainNumbers) {
      // Check if train exists
      let train = await Train.findOne({ trainNumber });
      
      if (!train) {
        // Create new train entry
        train = new Train({
          trainNumber,
          trainName: `Train ${trainNumber}`, // Default name, can update later
          status: 'running',
          currentLocation: {
            type: 'Point',
            coordinates: [0, 0] // Default coordinates
          }
        });
        
        await train.save();
        results.push({ trainNumber, action: 'created' });
      } else {
        results.push({ trainNumber, action: 'exists' });
      }
    }
    
    // Trigger initial update
    await updateAllTrains();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Trains initialized and updated', 
      results 
    });
  } catch (error) {
    console.error('Failed to initialize train tracking:', error);
    return NextResponse.json(
      { error: 'Failed to initialize train tracking' },
      { status: 500 }
    );
  }
}

// Also allow manual updates through GET endpoint
export async function GET(request: NextRequest) {
  // Validate admin API key
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await updateAllTrains();
    return NextResponse.json({ 
      success: true, 
      message: 'Manual update triggered successfully' 
    });
  } catch (error) {
    console.error('Manual update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update trains' },
      { status: 500 }
    );
  }
}