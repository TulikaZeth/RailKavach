"use client";

// This is necessary to use client-side features like onClick

export default function SendWhatsAppButton() {

    const cakc = async (speed: number, lat: number, long: number) => {
        try {
            const response = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ speed, lat, long }),
            });
    
            const data = await response.json();
            return data.distance || 0;
        } catch (error) {
            console.error("Error calling local API:", error);
            return 0;
        }
    };

  return (
    <div>
      <button
        onClick={() => cakc(60, 12.9716, 77.5946)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Button
      </button>
    </div>
  );
}
