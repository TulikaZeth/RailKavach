const axios = require('axios'); // For making HTTP requests
const { exec } = require('child_process'); // For playing system beep

// API endpoint
const apiUrl = 'http://localhost:3000/api/alerts'; // Replace with your API URL

// Camera ID to monitor
const targetCameraId = "67d46885230a07d3aee44fe3"; // Replace with the camera ID you want to monitor

// Function to fetch alerts from the API
async function fetchAlerts() {
  try {
    const response = await axios.get(apiUrl);
    return response.data; // Return the list of alerts
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    return []; // Return an empty array if the request fails
  }
}

// Function to "play buzzer" (console beep)
function playBuzzer() {
  console.log('\x07'); // System beep (if supported by the terminal)
  console.log('🚨 ALERT DETECTED! BUZZER ACTIVATED! 🚨');
}

// Main function to check for alerts
async function checkAlerts() {
  console.log('Checking for alerts...');

  const alerts = await fetchAlerts();
//   console.log(alerts[0].camera._id)

  // Check if there are any unresolved alerts for the target camera
  const unresolvedAlerts = alerts.filter(
    (alert) => alert.status !== 'resolved' && alert.camera._id === targetCameraId
  );

  if (unresolvedAlerts.length > 0) {
    console.log('Unresolved alerts detected for camera', targetCameraId, ':', unresolvedAlerts);
    playBuzzer(); // Simulate buzzer
  } else {
    console.log('No unresolved alerts detected for camera', targetCameraId);
  }
}

// Run the alert check every 5 seconds
setInterval(checkAlerts, 10000);

// Initial check
checkAlerts();