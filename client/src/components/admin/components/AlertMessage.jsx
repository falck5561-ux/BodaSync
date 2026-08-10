import React from 'react';

const ALERT_TITLES = {
  error: 'Ocurrió un problema',
  success: 'Operación completada',
  warning: 'Atención',
  info: 'Información'
};

const ALERT_ICONS = {
  error: '!',
  success: '✓',
  warning: '!',
  info: 'i'
};

export default function AlertMessage({
  type = 'info',
  message = '',
  title = '',
  onClose,
  className = ''
}) {
  if (!message) {
    return null;
  }

  const validTypes = [
    'error',
    'success',
    'warning',
    'info'
  ];

  const alertType = validTypes.includes(type)
    ? type
    : 'info';

  const alertTitle =
    title || ALERT_TITLES[alertType];

  const alertIcon =
    ALERT_ICONS[alertType];

  function handleClose() {
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  return (
    <div
      className={`alert alert-${alertType} ${className}`.trim()}
      role={
        alertType === 'error'
          ? 'alert'
          : 'status'
      }
      aria-live={
        alertType === 'error'
          ? 'assertive'
          : 'polite'
      }
    >
      <div className="alert-icon" aria-hidden="true">
        {alertIcon}
      </div>

      <div className="alert-content">
        <strong className="alert-title">
          {alertTitle}
        </strong>

        <p className="alert-message">
          {message}
        </p>
      </div>

      {typeof onClose === 'function' && (
        <button
          type="button"
          className="alert-close-button"
          onClick={handleClose}
          aria-label="Cerrar mensaje"
          title="Cerrar"
        >
          ×
        </button>
      )}
    </div>
  );
}