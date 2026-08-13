// src/background.ts

const BACKEND_URL = 'http://localhost:3000/api/extension';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const IDLE_DETECTION_SECONDS = 900; // 15 minutes

let heartbeatTimer: any = null;

// Initialize Idle Detection
chrome.runtime.onInstalled.addListener(() => {
  chrome.idle.setDetectionInterval(IDLE_DETECTION_SECONDS);
  console.log('Extension Installed: Idle detection set to 15 mins.');
});

// Start syncing when HRMS sends the token
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_SESSION') {
    const { employeeId, attendanceId, token } = message.payload;
    
    chrome.storage.local.set({ employeeId, attendanceId, token, status: 'Working' }, () => {
      startHeartbeat();
      sendResponse({ success: true });
    });
    return true;
  }
});

// Idle State Listener
chrome.idle.onStateChanged.addListener((newState) => {
  // newState can be 'active', 'idle', or 'locked'
  const statusMap: Record<string, string> = {
    'active': 'Working',
    'idle': 'Idle',
    'locked': 'Offline' // Optionally handle locked
  };
  
  const status = statusMap[newState] || 'Working';
  
  chrome.storage.local.set({ status }, () => {
    if (status === 'Idle') {
      sendEventToBackend('/idle/start', { status });
    } else {
      sendEventToBackend('/status', { status });
    }
  });
});

// The Heartbeat Engine
function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  
  // Send immediate heartbeat
  sendEventToBackend('/heartbeat', {});

  heartbeatTimer = setInterval(() => {
    sendEventToBackend('/heartbeat', {});
  }, HEARTBEAT_INTERVAL);
}

// Module 6: Offline Queueing & API sync
async function sendEventToBackend(endpoint: string, extraPayload: any) {
  const data = await chrome.storage.local.get(['employeeId', 'attendanceId', 'token', 'status', 'offlineQueue']);
  
  if (!data.employeeId || !data.attendanceId) return; // No active session

  const payload = {
    employeeId: data.employeeId,
    attendanceId: data.attendanceId,
    status: data.status,
    deviceId: 'DEVICE_ID_PLACEHOLDER', // You can generate/store a unique ID if needed
    latency: 0, // Simplified for now
    ...extraPayload,
  };

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // If we are online and succeeded, try flushing the offline queue
      flushOfflineQueue();
    } else {
      throw new Error('Backend responded with error');
    }
  } catch (err) {
    // We are offline or backend is down. Queue it!
    console.warn("Offline! Queuing event:", endpoint);
    const queue = (Array.isArray(data.offlineQueue) ? data.offlineQueue : []) as any[];
    queue.push({ endpoint, payload, timestamp: new Date().toISOString() });
    chrome.storage.local.set({ offlineQueue: queue });
  }
}

async function flushOfflineQueue() {
  const data = await chrome.storage.local.get(['offlineQueue', 'token']);
  const queue = (Array.isArray(data.offlineQueue) ? data.offlineQueue : []) as any[];
  
  if (queue.length === 0) return;

  const newQueue = [];
  
  for (const item of queue) {
    try {
      const response = await fetch(`${BACKEND_URL}${item.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
        body: JSON.stringify(item.payload)
      });
      if (!response.ok) newQueue.push(item);
    } catch (e) {
      newQueue.push(item);
    }
  }

  chrome.storage.local.set({ offlineQueue: newQueue });
}
