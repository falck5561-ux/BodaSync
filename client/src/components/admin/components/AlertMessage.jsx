import React, { useEffect, useMemo } from 'react';

const ALERT_CONFIG = {
  error: {
    title: 'No se pudo completar',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6" />
        <path d="m15 9-6 6" />
      </svg>
    )
  },

  success: {
    title: 'Listo',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12 2.3 2.4 4.8-5" />
      </svg>
    )
  },

  warning: {
    title: 'Revisa esto',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    )
  },

  info: {
    title: 'Información',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    )
  }
};

const VALID_TYPES = [
  'error',
  'success',
  'warning',
  'info'
];

export default function AlertMessage({
  type = 'info',
  message = '',
  title = '',
  onClose,
  className = '',
  duration = 4500
}) {
  const alertType = VALID_TYPES.includes(type)
    ? type
    : 'info';

  const config = useMemo(
    () => ALERT_CONFIG[alertType],
    [alertType]
  );

  const alertTitle =
    typeof title === 'string' && title.trim()
      ? title.trim()
      : config.title;

  const shouldAutoClose =
    Boolean(message) &&
    typeof onClose === 'function' &&
    Number(duration) > 0;

  useEffect(() => {
    if (!shouldAutoClose) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, Number(duration));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    duration,
    message,
    onClose,
    shouldAutoClose
  ]);

  if (!message) {
    return null;
  }

  function handleClose() {
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  return (
    <div
      className={`admin-toast admin-toast-${alertType} ${className}`.trim()}
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
      aria-atomic="true"
    >
      <span
        className="admin-toast-icon"
        aria-hidden="true"
      >
        {config.icon}
      </span>

      <div className="admin-toast-content">
        <strong className="admin-toast-title">
          {alertTitle}
        </strong>

        <p className="admin-toast-message">
          {message}
        </p>
      </div>

      {typeof onClose === 'function' && (
        <button
          type="button"
          className="admin-toast-close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
          title="Cerrar"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 6 8 8" />
            <path d="m14 6-8 8" />
          </svg>
        </button>
      )}

      {shouldAutoClose && (
        <span
          className="admin-toast-progress"
          aria-hidden="true"
          style={{
            animationDuration: `${Number(duration)}ms`
          }}
        />
      )}
    </div>
  );
}