// src/lib/trainTrackingSetup.ts
import { updateAllTrains } from '@/services/trainTrackingService';
import fs from 'fs';
import path from 'path';

// Flag file to track if updates are running
const UPDATE_FLAG_FILE = path.join(process.cwd(), '.train-update-running');

let updateInterval: NodeJS.Timeout | null = null;

export function startTrainTracking() {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Create flag file to indicate updates are running
  fs.writeFileSync(UPDATE_FLAG_FILE, new Date().toISOString());
  
  // Initial update
  updateAllTrains().catch(err => {
    console.error('Initial train update failed:', err);
  });
  
  // Set interval for every 10 minutes (600000 ms)
  updateInterval = setInterval(async () => {
    try {
      await updateAllTrains();
    } catch (error) {
      console.error('Scheduled train update failed:', error);
    }
  }, 600000);
  
  console.log('Train tracking service started');
  
  return () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
      
      // Remove flag file when stopped
      if (fs.existsSync(UPDATE_FLAG_FILE)) {
        fs.unlinkSync(UPDATE_FLAG_FILE);
      }
      
      console.log('Train tracking service stopped');
    }
  };
}

export function isTrackingRunning(): boolean {
  return fs.existsSync(UPDATE_FLAG_FILE);
}