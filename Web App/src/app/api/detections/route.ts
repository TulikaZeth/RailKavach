import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import  connectToDatabase from '@/lib/db';
import { Camera, DetectionEvent } from '@/models/schema';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('cameraId');
    const status = searchParams.get('status');
    const animalType = searchParams.get('animalType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const filter: any = {};
    
    if (cameraId && mongoose.Types.ObjectId.isValid(cameraId)) {
      filter.camera = new mongoose.Types.ObjectId(cameraId);
    }
    
    if (status) filter.status = status;
    if (animalType) filter.animalType = animalType;
    
    if (startDate || endDate) {
      filter.detectedAt = {};
      if (startDate) filter.detectedAt.$gte = new Date(startDate);
      if (endDate) filter.detectedAt.$lte = new Date(endDate);
    }
    
    const detections = await DetectionEvent.find(filter)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('camera', 'cameraId location railwaySection')
      .lean();
    
    const total = await DetectionEvent.countDocuments(filter);
    
    return NextResponse.json({
      data: detections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch detections', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Validate that camera exists
    if (!mongoose.Types.ObjectId.isValid(body.camera)) {
      return NextResponse.json({ error: 'Invalid camera ID format' }, { status: 400 });
    }
    
    const camera = await Camera.findById(body.camera);
    if (!camera) {
      return NextResponse.json({ error: 'Camera not found' }, { status: 404 });
    }
    
    const detection = new DetectionEvent(body);
    await detection.save();
    
    return NextResponse.json(detection, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create detection event', details: error.message },
      { status: 400 }
    );
  }
}