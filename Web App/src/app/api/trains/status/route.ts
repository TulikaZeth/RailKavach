import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const url =
    "https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status";
  const searchParams = new URL(request.url).searchParams;
  const trainNumber = searchParams.get("train_number");

  if (!trainNumber) {
    return NextResponse.json(
      { error: "Train number is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(url, {
      params: {
        departure_date: "20250313",
        train_number: trainNumber,
        isH5: "true",
        client: "web",
      },
      headers: {
        'x-rapidapi-key': 'e6b8aa2ca4msh1164529d9b8edd3p1d020fjsn56809441172b',
        'x-rapidapi-host': 'indian-railway-irctc.p.rapidapi.com',
        'x-rapid-api': 'rapid-api-database'
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching train status:", error);
    return NextResponse.json(
      { error: "Failed to fetch train status" },
      { status: 500 }
    );
  }
}
