import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Alert, DetectionEvent } from "@/models/schema";

export async function GET({ params }: { params: { detectionId: string } }) {
  try {
    await connectToDatabase();

    const { detectionId } = params;

    if (!mongoose.Types.ObjectId.isValid(detectionId)) {
      return NextResponse.json(
        { error: "Invalid detection ID format" },
        { status: 400 }
      );
    }

    const detection = await DetectionEvent.findById(detectionId)
      .populate("camera", "cameraId location railwaySection")
      .lean();

    if (!detection) {
      return NextResponse.json(
        { error: "Detection event not found" },
        { status: 404 }
      );
    }

    // Get related alerts
    const relatedAlerts = await Alert.find({ eventId: detectionId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      ...detection,
      relatedAlerts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch detection details", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { detectionId: string } }
) {
  try {
    await connectToDatabase();

    const { detectionId } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(detectionId)) {
      return NextResponse.json(
        { error: "Invalid detection ID format" },
        { status: 400 }
      );
    }

    // If adding a new action
    if (body.addAction) {
      const detection = await DetectionEvent.findByIdAndUpdate(
        detectionId,
        {
          $push: {
            actionsTaken: {
              actionType: body.addAction.actionType,
              timestamp: new Date(),
              details: body.addAction.details,
            },
          },
        },
        { new: true, runValidators: true }
      ).lean();

      if (!detection) {
        return NextResponse.json(
          { error: "Detection event not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(detection);
    }

    // Otherwise update main fields
    const detection = await DetectionEvent.findByIdAndUpdate(
      detectionId,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!detection) {
      return NextResponse.json(
        { error: "Detection event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(detection);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update detection event", details: error.message },
      { status: 400 }
    );
  }
}
