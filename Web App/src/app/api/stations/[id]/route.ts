import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Station } from '@/models/schema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const station = await Station.findById(params.id);
    
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    
    return NextResponse.json(station, { status: 200 });
  } catch (error) {
    console.error(`Error fetching station ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch station' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const updatedStation = await Station.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedStation) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedStation, { status: 200 });
  } catch (error) {
    console.error(`Error updating station ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update station' }, { status: 500 });
  }
}
