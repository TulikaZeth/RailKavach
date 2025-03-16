import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { DetectionEvent } from '@/models/schema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const event = await DetectionEvent.findById(params.id)
      .populate('camera');
    
    if (!event) {
      return NextResponse.json({ error: 'Detection event not found' }, { status: 404 });
    }
    
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error(`Error fetching detection event ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch detection event' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const updatedEvent = await DetectionEvent.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Detection event not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error(`Error updating detection event ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update detection event' }, { status: 500 });
  }
}