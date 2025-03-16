import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DetectionEvent } from '@/models/schema';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { actionType, details } = await request.json();
    await connectToDatabase();
    
    const event = await DetectionEvent.findById(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Detection event not found' }, { status: 404 });
    }
    
    const action = {
      actionType,
      timestamp: new Date(),
      details
    };
    
    const updatedEvent = await DetectionEvent.findByIdAndUpdate(
      params.id,
      { $push: { actionsTaken: action } },
      { new: true }
    );
    
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error(`Error adding action to detection event ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to add action to detection event' }, { status: 500 });
  }
}
