import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Alert } from '@/models/schema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const alert = await Alert.findById(params.id)
      .populate('camera')
      .populate('eventId')
      .populate('affectedTrains')
      .populate('notifiedStations');
    
    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json(alert, { status: 200 });
  } catch (error) {
    console.error(`Error fetching alert ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch alert' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error(`Error updating alert ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
