'use client'; // This is necessary to use client-side features like onClick

import { useState } from 'react';

export default function SendWhatsAppButton() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSendWhatsApp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-msg', {
        method: 'POST'
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleSendWhatsApp} 
        disabled={loading}
        style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        {loading ? 'Sending...' : 'Send WhatsApp Message'}
      </button>
      {response && (
        <div style={{ marginTop: '20px' }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}