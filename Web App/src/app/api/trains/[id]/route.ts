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
    
    return NextResponse.json(train, { status: 200 });
  } catch (error) {
    console.error(`Error fetching train ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch train' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const updatedTrain = await Train.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
    if (!updatedTrain) {
      return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTrain, { status: 200 });
  } catch (error) {
    console.error(`Error updating train ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to update train' }, { status: 500 });
  }
}