const fs = require('fs');

const cssToAdd = `
/* ============================================
   TABLE ACTION BUTTONS
   ============================================ */

.action-btn-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
  line-height: 1;
}

/* Primary action (Assign, Approve, Submit) */
.action-btn.primary {
  background: var(--brand-primary);
  color: white;
  border-color: var(--brand-primary);
}
.action-btn.primary:hover {
  background: var(--brand-primary-hover);
  border-color: var(--brand-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}

/* Secondary action (Edit, View, Details) */
.action-btn.secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-primary);
}
.action-btn.secondary:hover {
  background: var(--card-bg);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  transform: translateY(-1px);
}

/* Ghost action (subtle, for less important actions) */
.action-btn.ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.action-btn.ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Success action (Approve) */
.action-btn.success {
  background: var(--badge-success-bg);
  color: var(--badge-success-text);
  border-color: transparent;
}
.action-btn.success:hover {
  background: var(--success);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
}

/* Danger action (Reject, Delete, Deactivate) */
.action-btn.danger {
  background: var(--badge-danger-bg);
  color: var(--badge-danger-text);
  border-color: transparent;
}
.action-btn.danger:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
}

/* Warning action (Send Back, Reconsider) */
.action-btn.warning {
  background: var(--badge-warning-bg);
  color: var(--badge-warning-text);
  border-color: transparent;
}
.action-btn.warning:hover {
  background: var(--warning);
  color: white;
  transform: translateY(-1px);
}

/* Icon-only buttons (three-dot menu, close, etc.) */
.action-btn.icon-only {
  padding: 6px;
  width: 32px;
  height: 32px;
}

/* Sizes */
.action-btn.sm { padding: 4px 8px; font-size: 12px; }
.action-btn.lg { padding: 8px 16px; font-size: 14px; }

/* Disabled state */
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
`;

let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.action-btn-group')) {
  css += cssToAdd;
  fs.writeFileSync('src/index.css', css);
  console.log('Appended CSS to index.css');
} else {
  console.log('CSS already exists in index.css');
}
