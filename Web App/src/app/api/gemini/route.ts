import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const COHERE_API_KEY = "Hpakk08DRezV7g1Mlo1IBofyZU4XF9EBWJ7Eiz6e";
const COHERE_API_URL = "https://api.cohere.ai/v1/generate";

export async function POST(req: NextRequest) {
    try {
        if (!COHERE_API_KEY) {
            return NextResponse.json({ error: "Missing API key" }, { status: 500 });
        }

        const { speed, lat, long } = await req.json();

        if (speed === undefined || lat === undefined || long === undefined) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        const prompt = `Calculate the safe stopping distance for a train moving at ${speed} m/s at coordinates (${lat}, ${long}). Consider normal train deceleration physics. Give the answer in kilometer and just number. Without units.`;

        const response = await axios.post(
            COHERE_API_URL,
            {
                model: "command-r-plus-08-2024",
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7, 
            },
            {
                headers: {
                    Authorization: `Bearer ${COHERE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const result = response.data.generations[0].text;
        // console.log(result);

        
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Error calling Cohere API:", error);

        if (axios.isAxiosError(error) && error.response) {
            return NextResponse.json(
                { error: "Failed to call Cohere API", details: error.response.data },
                { status: error.response.status }
            );
        }

        return NextResponse.json({ error: "Failed to call Cohere API" }, { status: 500 });
    }
}