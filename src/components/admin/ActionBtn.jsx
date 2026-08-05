import React from 'react';

const STYLES = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1.5px solid',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    lineHeight: '1',
    transition: 'all 0.18s ease',
    textDecoration: 'none',
    outline: 'none',
  },
  secondary: {
    background: '#f9fafb',
    color: '#374151',
    borderColor: '#d1d5db',
  },
  ghost: {
    background: '#f9fafb',
    color: '#6b7280',
    borderColor: '#d1d5db',
  },
  primary: {
    background: '#2563eb',
    color: '#ffffff',
    borderColor: '#2563eb',
  },
  success: {
    background: '#ecfdf5',
    color: '#059669',
    borderColor: '#6ee7b7',
  },
  danger: {
    background: '#fef2f2',
    color: '#dc2626',
    borderColor: '#fca5a5',
  },
  warning: {
    background: '#fffbeb',
    color: '#d97706',
    borderColor: '#fcd34d',
  },
  iconOnly: {
    padding: '6px',
    width: '34px',
    height: '34px',
    justifyContent: 'center',
  },
};

const ActionBtn = ({
  variant = 'secondary',
  iconOnly = false,
  children,
  onClick,
  title,
  disabled,
  as: Tag = 'button',
  href,
  to,
  style: extraStyle = {},
  ...rest
}) => {
  const variantStyle = STYLES[variant] || STYLES.secondary;
  const combined = {
    ...STYLES.base,
    ...variantStyle,
    ...(iconOnly ? STYLES.iconOnly : {}),
    ...(disabled ? { opacity: 0.45, cursor: 'not-allowed' } : {}),
    ...extraStyle,
  };

  return (
    <Tag
      style={combined}
      onClick={onClick}
      title={title}
      disabled={disabled}
      href={href}
      to={to}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default ActionBtn;
