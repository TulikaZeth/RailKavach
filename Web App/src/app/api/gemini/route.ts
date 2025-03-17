import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Load API key from environment variables
const COHERE_API_KEY = "Hpakk08DRezV7g1Mlo1IBofyZU4XF9EBWJ7Eiz6e";
const COHERE_API_URL = "https://api.cohere.ai/v1/generate";

export async function POST(req: NextRequest) {
    try {
        // Ensure API key exists
        if (!COHERE_API_KEY) {
            return NextResponse.json({ error: "Missing API key" }, { status: 500 });
        }

        // Parse JSON request body
        const { speed, lat, long } = await req.json();

        // Validate request parameters
        if (speed === undefined || lat === undefined || long === undefined) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Generate the prompt for Cohere
        const prompt = `Calculate the safe stopping distance for a train moving at ${speed} m/s at coordinates (${lat}, ${long}). Consider normal train deceleration physics. Give the answer in kilometer and just number. Without units.`;

        // Make request to Cohere API
        const response = await axios.post(
            COHERE_API_URL,
            {
                model: "command-r-plus-08-2024", // Use the appropriate model (check Cohere documentation)
                prompt: prompt,
                max_tokens: 500, // Specify token limit
                temperature: 0.7, // Adjust temperature for creativity
            },
            {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Extract the generated text
        const result = response.data.generations[0].text;
        // console.log(result);

        
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Error calling Cohere API:", error);

        // Check if the error is an AxiosError and has a response
        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                { error: "Failed to call Cohere API", details: error.response.data },
                { status: error.response.status }
            );
        }

        return NextResponse.json({ error: "Failed to call Cohere API" }, { status: 500 });
    }
}