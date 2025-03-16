import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Station } from '@/models/schema';

export async function GET() {
  try {
    await connectToDatabase();
    const stations = await Station.find({});
    return NextResponse.json(stations, { status: 200 });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    const newStation = new Station(body);
    const savedStation = await newStation.save();
    return NextResponse.json(savedStation, { status: 201 });
  } catch (error) {
    console.error('Error creating station:', error);
    return NextResponse.json({ error: 'Failed to create station' }, { status: 500 });
  }
}
