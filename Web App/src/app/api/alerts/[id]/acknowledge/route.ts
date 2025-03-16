import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { Alert } from '@/models/schema';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, userName } = await request.json();
    await connectToDatabase();
    
    const updatedAlert = await Alert.findByIdAndUpdate(
      params.id,
      { 
        $set: { 
          status: 'acknowledged',
          acknowledgedBy: {
            userId,
            userName,
            timestamp: new Date()
          }
        } 
      },
      { new: true }
    );
    
    if (!updatedAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedAlert, { status: 200 });
  } catch (error) {
    console.error(`Error acknowledging alert ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to acknowledge alert' }, { status: 500 });
  }
}