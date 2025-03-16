import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Camera } from '@/models/schema';

export async function GET() {
  try {
    await connectToDatabase();
    const cameras = await Camera.find({}).populate('nearestStation');
    return NextResponse.json(cameras, { status: 200 });
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return NextResponse.json({ error: 'Failed to fetch cameras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const newCamera = new Camera(body);
    const savedCamera = await newCamera.save();
    return NextResponse.json(savedCamera, { status: 201 });
  } catch (error) {
    console.error('Error creating camera:', error);
    return NextResponse.json({ error: 'Failed to create camera' }, { status: 500 });
  }
}
