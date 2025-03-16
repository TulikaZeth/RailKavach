import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DetectionEvent, Alert } from '@/models/schema';

export async function GET() {
  try {
    await connectToDatabase();
    const events = await DetectionEvent.find({})
      .populate('camera')
      .sort({ detectedAt: -1 });
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching detection events:', error);
    return NextResponse.json({ error: 'Failed to fetch detection events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Create the detection event
    const newEvent = new DetectionEvent({
      ...body,
      detectedAt: new Date(),
      status: 'detected'
    });
    
    const savedEvent = await newEvent.save();
    
    // Generate alert automatically for the event
    const newAlert = new Alert({
      eventId: savedEvent._id,
      camera: savedEvent.camera,
      alertType: 'animal_detected',
      alertSeverity: body.confidence > 80 ? 'high' : 'medium',
      status: 'active'
    });
    
    await newAlert.save();
    
    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating detection event:', error);
    return NextResponse.json({ error: 'Failed to create detection event' }, { status: 500 });
  }
}
