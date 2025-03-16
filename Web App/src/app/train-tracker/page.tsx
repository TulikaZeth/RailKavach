'use client';
import { useState } from 'react';

export default function TrainTracker() {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [error, setError] = useState('');

  const fetchTrainStatus = async () => {
    setError('');
    try {
      const res = await fetch(`/api/trains/status?train_number=${trainNumber}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTrainData(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Train Tracker</h1>
      <input
        type="text"
        value={trainNumber}
        onChange={(e) => setTrainNumber(e.target.value)}
        placeholder="Enter Train Number"
        className="border p-2"
      />
      <button onClick={fetchTrainStatus} className="ml-2 bg-blue-500 text-white px-4 py-2">
        Track
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {trainData && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Train Status</h2>
          <p>Current Station: {trainData.body.current_station}</p>
          <p>Status: {trainData.body.train_status_message}</p>
        </div>
      )}
    </div>
  );
}
