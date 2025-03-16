// src/app/api/_middleware.ts (or another appropriate server initialization file)
import { NextRequest, NextResponse } from 'next/server';
import { startTrainTracking, isTrackingRunning } from '@/lib/trainTrackingSetup';

// Start tracking on application startup
let trackingStopFn: (() => void) | null = null;

// Only start in production or if explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_TRAIN_TRACKING === 'true') {
  if (!isTrackingRunning()) {
    trackingStopFn = startTrainTracking();
    
    // Stop tracking when app shuts down
    process.on('SIGTERM', () => {
      if (trackingStopFn) {
        trackingStopFn();
      }
    });
  }
}

// This is a simple middleware to check train tracking status
export async function middleware(request: NextRequest) {
  // Only apply to specific route
  if (request.nextUrl.pathname === '/api/admin/tracking-status') {
    return NextResponse.json({
      isRunning: isTrackingRunning(),
      environment: process.env.NODE_ENV,
      startedAt: isTrackingRunning() ? 
        new Date(fs.readFileSync(UPDATE_FLAG_FILE, 'utf8')).toISOString() : null,
      nextUpdateIn: trackingStopFn ? 
        `${Math.floor((600000 - (Date.now() % 600000)) / 1000)} seconds` : null
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/tracking-status',
};