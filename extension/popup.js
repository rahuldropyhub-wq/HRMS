document.addEventListener('DOMContentLoaded', async () => {
  const emailInput = document.getElementById('email-input');
  const connectedEmail = document.getElementById('connected-email');
  const saveBtn = document.getElementById('save-btn');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Load existing configuration
  const data = await chrome.storage.local.get(['employeeEmail']);
  if (data.employeeEmail) {
    emailInput.value = data.employeeEmail;
    connectedEmail.textContent = `Tracking: ${data.employeeEmail}`;
    statusDot.style.background = '#10b981';
    statusText.textContent = 'Active & Syncing';
  } else {
    statusDot.style.background = '#f59e0b';
    statusText.textContent = 'Setup Required';
  }

  saveBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;

    await chrome.storage.local.set({ employeeEmail: email });
    connectedEmail.textContent = `Tracking: ${email}`;
    statusDot.style.background = '#10b981';
    statusText.textContent = 'Active & Syncing';

    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
      saveBtn.textContent = 'Save & Start Tracking';
    }, 1500);
  });
});
