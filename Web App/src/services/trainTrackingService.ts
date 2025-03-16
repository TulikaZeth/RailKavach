// src/services/trainTrackingService.ts
import axios from 'axios';
import { Train } from '@/models/schema';
import { connectToDatabase } from '@/lib/db';

interface TrainStatusResponse {
  body: {
    current_station: string;
    stations: Array<{
      stationCode: string;
      stationName: string;
      actual_arrival_time: string;
      actual_departure_time: string;
      distance: string;
    }>;
  };
}

interface StationCoordinates {
  coordinates: [number, number]; // [longitude, latitude]
  speed: number;
}

// Cache station coordinates to reduce API calls
const stationCoordinatesCache: Record<string, { coordinates: [number, number], timestamp: number }> = {};

export async function fetchTrainStatus(trainNumber: string): Promise<TrainStatusResponse | null> {
  const today = new Date();
  const formattedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  
  const options = {
    method: 'GET',
    url: 'https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status',
    params: {
      departure_date: formattedDate,
      isH5: 'true',
      client: 'web',
      train_number: trainNumber
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY || 'e6b8aa2ca4msh1164529d9b8edd3p1d020fjsn56809441172b',
      'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
      'x-rapid-api': 'rapid-api-database'
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(`Error fetching status for train ${trainNumber}:`, error);
    return null;
  }
}

async function getStationCoordinatesFromGemini(stationCode: string, stationName: string): Promise<StationCoordinates | null> {
  // Check cache first (valid for 24 hours)
  const cacheEntry = stationCoordinatesCache[stationCode];
  if (cacheEntry && (Date.now() - cacheEntry.timestamp) < 24 * 60 * 60 * 1000) {
    return { coordinates: cacheEntry.coordinates, speed: calculateApproximateSpeed(stationCode) };
  }

  // If using Google's Gemini API (replace with your implementation)
  const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.gemini.ai/v1/models/gemini-pro:generateContent';
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return null;
  }

  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: `Please provide only the longitude and latitude coordinates for "${stationName}" railway station in India (station code: ${stationCode}) in JSON format like {"longitude": number, "latitude": number}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`
        }
      }
    );

    // Extract coordinates from Gemini response
    // This is a simplified implementation - you might need to adjust based on actual Gemini API response format
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Extract the JSON object from the response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Store in cache
      const coordinates: [number, number] = [parsedResponse.longitude, parsedResponse.latitude];
      stationCoordinatesCache[stationCode] = {
        coordinates,
        timestamp: Date.now()
      };
      
      return { 
        coordinates,
        speed: calculateApproximateSpeed(stationCode)
      };
    }
    
    throw new Error('Could not parse coordinates from response');
  } catch (error) {
    console.error(`Error getting coordinates for station ${stationCode}:`, error);
    return null;
  }
}

function calculateApproximateSpeed(stationCode: string): number {
  // Simulate speed calculation based on station, time of day, etc.
  // In a real implementation, you might use historical data or calculate based on 
  // distance between stations and time difference
  
  // Random speed between 40-110 km/h for demonstration
  const baseSpeed = 40;
  const randomFactor = Math.floor(Math.random() * 70);
  return baseSpeed + randomFactor;
}

export async function updateTrainLocation(trainId: string, coordinates: [number, number], speed: number): Promise<boolean> {
  try {
    const response = await axios.post(
      `/api/trains/${trainId}`,
      { coordinates, speed },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error(`Error updating train ${trainId} location:`, error);
    return false;
  }
}

export async function updateAllTrains(): Promise<void> {
  try {
    await connectToDatabase();
    
    // Get all trains from the database
    const trains = await Train.find().lean();
    
    for (const train of trains) {
      const trainStatus = await fetchTrainStatus(train.trainNumber);
      
      if (!trainStatus?.body) {
        console.log(`No status data available for train ${train.trainNumber}`);
        continue;
      }
      
      const currentStationCode = trainStatus.body.current_station;
      
      // Find the current station in the stations list
      const currentStation = trainStatus.body.stations.find(
        station => station.stationCode === currentStationCode
      );
      
      if (!currentStation) {
        console.log(`Current station ${currentStationCode} not found in station list for train ${train.trainNumber}`);
        continue;
      }
      
      const stationCoordinates = await getStationCoordinatesFromGemini(
        currentStation.stationCode,
        currentStation.stationName
      );
      
      if (!stationCoordinates) {
        console.log(`Could not get coordinates for station ${currentStation.stationCode}`);
        continue;
      }
      
      // Update train location in database
      await updateTrainLocation(
        train._id.toString(),
        stationCoordinates.coordinates,
        stationCoordinates.speed
      );
      
      console.log(`Updated location for train ${train.trainNumber} at station ${currentStation.stationName}`);
    }
    
    console.log(`Train tracking update completed at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error in updateAllTrains:', error);
  }
}