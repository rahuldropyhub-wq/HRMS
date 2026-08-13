// src/content.ts
// Content Script running on Dropyhub website

console.log("Dropyhub Extension Content Script Injected.");

// This will listen for messages or DOM events from the HRMS React app
window.addEventListener('message', (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  if (event.data.type && (event.data.type === 'HRMS_SESSION_START')) {
    console.log("Content script received session start from HRMS.");
    // Forward to background script
    chrome.runtime.sendMessage({
      type: 'SYNC_SESSION',
      payload: event.data.payload
    });
  }
});
