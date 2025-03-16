import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Alert, DetectionEvent } from '@/models/schema';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { notes } = await request.json();
    await connectToDatabase();
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      params.id,
      { 
        $set: { 
          status: 'resolved',
          resolvedAt: new Date(),
          notes: notes
        } 
      },
      { new: true }
    );
    
    if (!updatedAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    // Also update the associated detection event
    if (updatedAlert.eventId) {
      await DetectionEvent.findByIdAndUpdate(
        updatedAlert.eventId,
        { $set: { status: 'cleared' } }
      );
    }
    
    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error(`Error resolving alert ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to resolve alert' }, { status: 500 });
  }
}