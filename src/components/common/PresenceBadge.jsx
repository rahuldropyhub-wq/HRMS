import React from 'react';

/**
 * Microsoft Teams Style Presence Badge Component
 * @param {string} status - 'online' | 'idle' | 'break' | 'busy' | 'offline'
 * @param {boolean} showLabel - Whether to display text label next to dot
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function PresenceBadge({ 
  status = 'offline', 
  showLabel = false, 
  size = 'md',
  idleSince = null,
  className = '' 
}) {
  const normStatus = (status || 'offline').toLowerCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case 'online':
      case 'working':
      case 'present':
        return {
          color: '#10b981',
          bg: '#ecfdf5',
          border: '#a7f3d0',
          label: 'Available',
          badgeText: 'Active Now',
          icon: '🟢'
        };
      case 'idle':
      case 'away':
        return {
          color: '#f59e0b',
          bg: '#fffbeb',
          border: '#fde68a',
          label: 'Away (Idle)',
          badgeText: 'Away',
          icon: '🟡'
        };
      case 'break':
      case 'on_break':
        return {
          color: '#f97316',
          bg: '#fff7ed',
          border: '#ffedd5',
          label: 'On Break',
          badgeText: 'Break',
          icon: '☕'
        };
      case 'busy':
        return {
          color: '#ef4444',
          bg: '#fef2f2',
          border: '#fecaca',
          label: 'Busy',
          badgeText: 'In Task',
          icon: '🔴'
        };
      case 'offline':
      default:
        return {
          color: '#94a3b8',
          bg: '#f1f5f9',
          border: '#e2e8f0',
          label: 'Offline',
          badgeText: 'Offline',
          icon: '⚪'
        };
    }
  };

  const config = getStatusConfig();

  const sizeMap = {
    sm: { dot: 8, font: 11, padding: '2px 6px' },
    md: { dot: 10, font: 12, padding: '3px 8px' },
    lg: { dot: 12, font: 13, padding: '4px 10px' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (showLabel) {
    return (
      <span 
        className={`presence-pill ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          padding: currentSize.padding,
          borderRadius: '20px',
          fontSize: `${currentSize.font}px`,
          fontWeight: '600',
          lineHeight: 1,
          whiteSpace: 'nowrap'
        }}
        title={`Status: ${config.label}${idleSince ? ` (Idle since ${new Date(idleSince).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}`}
      >
        <span 
          style={{
            width: `${currentSize.dot}px`,
            height: `${currentSize.dot}px`,
            borderRadius: '50%',
            backgroundColor: config.color,
            boxShadow: normStatus === 'online' ? `0 0 6px ${config.color}` : 'none'
          }}
        />
        <span>{config.badgeText}</span>
      </span>
    );
  }

  return (
    <span 
      className={`presence-dot ${className}`}
      title={config.label}
      style={{
        display: 'inline-block',
        width: `${currentSize.dot}px`,
        height: `${currentSize.dot}px`,
        borderRadius: '50%',
        backgroundColor: config.color,
        border: '1.5px solid #ffffff',
        boxShadow: normStatus === 'online' ? `0 0 8px ${config.color}` : '0 1px 2px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
    />
  );
}
