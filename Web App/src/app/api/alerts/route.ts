import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Alert } from '@/models/schema';

export async function GET() {
  try {
    await connectToDatabase();
    const alerts = await Alert.find({})
      .populate('camera')
      .populate('eventId')
      .populate('affectedTrains')
      .populate('notifiedStations')
      .sort({ createdAt: -1 });
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const newAlert = new Alert(body);
    const savedAlert = await newAlert.save();
    return NextResponse.json(savedAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}