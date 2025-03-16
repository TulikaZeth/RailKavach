import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Camera } from '@/models/schema';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const camera = await Camera.findById(params.id).populate('nearestStation');
    
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    
    return NextResponse.json(camera, { status: 200 });
  } catch (error) {
    console.error(`Error fetching camera ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch camera' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const updatedCamera = await Camera.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedCamera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedCamera, { status: 200 });
  } catch (error) {
    console.error(`Error updating camera ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update camera' }, { status: 500 });
  }
}