import { Camera } from '@/models/schema';
import { connectToDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const maxDistance = parseInt(searchParams.get('maxDistance') || '10000'); // in meters
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (isNaN(longitude) || isNaN(latitude)) {
      return NextResponse.json(
        { error: 'Invalid location coordinates' },
        { status: 400 }
      );
    }
    
    const nearestCameras = await Camera.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      },
      status: 'active'
    })
    .limit(limit)
    .populate('nearestStation', 'stationName stationCode')
    .lean();
    
    return NextResponse.json(nearestCameras);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to find nearest cameras', details: error.message },
      { status: 500 }
    );
  }
}