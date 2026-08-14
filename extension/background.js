// Dropyhub HRMS Activity & Presence Background Worker (Manifest V3)

const IDLE_DETECTION_INTERVAL_SEC = 180; // 3 minutes of OS-wide inactivity
const BACKEND_URL = 'http://localhost:3000/api/extension';

chrome.runtime.onInstalled.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL_SEC);
  chrome.alarms.create('presence_heartbeat', { periodInMinutes: 0.5 }); // Every 30 seconds
  console.log('Dropyhub Activity Tracker Extension installed.');
});

// Periodic heartbeat alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'presence_heartbeat') {
    chrome.idle.queryState(IDLE_DETECTION_INTERVAL_SEC, (state) => {
      sendHeartbeat(state);
    });
  }
});

// Real-time state transition listener (active -> idle / locked)
chrome.idle.onStateChanged.addListener((newState) => {
  console.log('OS Idle State Changed:', newState);
  sendHeartbeat(newState);
});

async function sendHeartbeat(osState) {
  try {
    const data = await chrome.storage.local.get(['employeeEmail', 'employeeId']);
    const email = data.employeeEmail;

    if (!email) return; // Not signed in to extension yet

    const status = osState === 'active' ? 'online' : osState === 'idle' ? 'idle' : 'offline';

    await fetch(`${BACKEND_URL}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        empId: data.employeeId || email,
        status: status,
        osState: osState,
        timestamp: new Date().toISOString()
      })
    });
  } catch (err) {
    console.debug('Heartbeat notice:', err);
  }
}
