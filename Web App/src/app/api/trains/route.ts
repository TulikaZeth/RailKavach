import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Train } from '@/models/schema';

export async function GET() {
  try {
    await connectToDatabase();
    const trains = await Train.find({});
    return NextResponse.json(trains, { status: 200 });
  } catch (error) {
    console.error('Error fetching trains:', error);
    return NextResponse.json({ error: 'Failed to fetch trains' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const newTrain = new Train(body);
    const savedTrain = await newTrain.save();
    return NextResponse.json(savedTrain, { status: 201 });
  } catch (error) {
    console.error('Error creating train:', error);
    return NextResponse.json({ error: 'Failed to create train' }, { status: 500 });
  }
}
