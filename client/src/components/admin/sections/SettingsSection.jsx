import React, { useEffect, useState } from 'react';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeMode(value, fallback = 'light') {
  return value === 'dark' || value === 'light'
    ? value
    : fallback;
}

function formatSavedAt(value) {
  if (!value) {
    return 'Todavía sin guardar';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Guardado recientemente';
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);

    function handleChange(event) {
      setMatches(event.matches);
    }

    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener?.('change', handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, [query]);

  return matches;
}

function SettingsCard({
  eyebrow,
  title,
  description,
  icon,
  children
}) {
  return (
    <section
      style={{
        overflow: 'hidden',
        border: '1px solid var(--admin-border)',
        borderRadius: '18px',
        background: 'var(--admin-surface)',
        boxShadow: 'var(--admin-shadow-xs)'
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          borderBottom: '1px solid var(--admin-border)',
          padding: '18px 20px'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              marginBottom: '6px',
              color: 'var(--admin-accent)',
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.16em',
              textTransform: 'uppercase'
            }}
          >
            {eyebrow}
          </span>

          <h2
            style={{
              margin: 0,
              color: 'var(--admin-text)',
              fontSize: '16px',
              fontWeight: 720
            }}
          >
            {title}
          </h2>

          {description && (
            <p
              style={{
                maxWidth: '720px',
                margin: '6px 0 0',
                color: 'var(--admin-text-secondary)',
                fontSize: '8px',
                lineHeight: 1.6
              }}
            >
              {description}
            </p>
          )}
        </div>

        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            width: '38px',
            height: '38px',
            minWidth: '38px',
            placeItems: 'center',
            border: '1px solid var(--admin-border)',
            borderRadius: '11px',
            background: 'var(--admin-surface-soft)',
            color: 'var(--admin-accent)',
            fontSize: '15px'
          }}
        >
          {icon}
        </span>
      </header>

      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  textarea = false,
  helper,
  required = false
}) {
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid var(--admin-border)',
    borderRadius: '11px',
    outline: 0,
    background: 'var(--admin-input)',
    color: 'var(--admin-text)',
    fontFamily: 'inherit',
    fontSize: '10px'
  };

  return (
    <div
      style={{
        display: 'grid',
        minWidth: 0,
        gap: '7px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <label
          htmlFor={name}
          style={{
            color: 'var(--admin-text)',
            fontSize: '8px',
            fontWeight: 750
          }}
        >
          {label}

          {required && (
            <span
              style={{
                marginLeft: '3px',
                color: 'var(--admin-danger)'
              }}
            >
              *
            </span>
          )}
        </label>

        {typeof maxLength === 'number' && (
          <span
            style={{
              color: 'var(--admin-text-muted)',
              fontSize: '7px'
            }}
          >
            {String(value || '').length}/{maxLength}
          </span>
        )}
      </div>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          rows={5}
          style={{
            ...inputStyle,
            minHeight: '118px',
            resize: 'vertical',
            padding: '12px 13px',
            lineHeight: 1.6
          }}
        />
      ) : (
        <input
          id={name}
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          style={{
            ...inputStyle,
            minHeight: '43px',
            padding: '0 13px'
          }}
        />
      )}

      {helper && (
        <small
          style={{
            color: 'var(--admin-text-muted)',
            fontSize: '7px',
            lineHeight: 1.5
          }}
        >
          {helper}
        </small>
      )}
    </div>
  );
}

function ThemeChoice({
  active,
  icon,
  title,
  description,
  onClick
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'grid',
        width: '100%',
        minWidth: 0,
        gap: '11px',
        border: active
          ? '1px solid var(--admin-accent)'
          : '1px solid var(--admin-border)',
        borderRadius: '14px',
        padding: '15px',
        background: active
          ? 'var(--admin-accent-soft)'
          : 'var(--admin-surface-soft)',
        color: 'var(--admin-text)',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: active
          ? '0 0 0 1px var(--admin-accent-glow)'
          : 'none',
        transition:
          'border-color .18s ease, background .18s ease, box-shadow .18s ease'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            width: '32px',
            height: '32px',
            placeItems: 'center',
            border: '1px solid var(--admin-border)',
            borderRadius: '9px',
            background: 'var(--admin-surface)',
            color: active
              ? 'var(--admin-accent)'
              : 'var(--admin-text-secondary)',
            fontSize: '14px'
          }}
        >
          {icon}
        </span>

        <span
          aria-hidden="true"
          style={{
            display: 'grid',
            width: '20px',
            height: '20px',
            placeItems: 'center',
            border: active
              ? '1px solid var(--admin-accent)'
              : '1px solid var(--admin-border)',
            borderRadius: '50%',
            background: active
              ? 'var(--admin-accent)'
              : 'transparent',
            color: '#0a111b',
            fontSize: '11px',
            fontWeight: 900
          }}
        >
          {active ? '✓' : ''}
        </span>
      </div>

      <div>
        <strong
          style={{
            display: 'block',
            color: 'var(--admin-text)',
            fontSize: '10px',
            fontWeight: 760
          }}
        >
          {title}
        </strong>

        <small
          style={{
            display: 'block',
            marginTop: '4px',
            color: 'var(--admin-text-muted)',
            fontSize: '7px',
            lineHeight: 1.55
          }}
        >
          {description}
        </small>
      </div>
    </button>
  );
}

function ToggleRow({
  name,
  checked,
  title,
  description,
  onChange
}) {
  return (
    <label
      style={{
        display: 'flex',
        minHeight: '66px',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        borderBottom: '1px solid var(--admin-border)',
        padding: '11px 0',
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          display: 'flex',
          minWidth: 0,
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <strong
          style={{
            color: 'var(--admin-text)',
            fontSize: '9px',
            fontWeight: 720
          }}
        >
          {title}
        </strong>

        <small
          style={{
            maxWidth: '720px',
            color: 'var(--admin-text-muted)',
            fontSize: '7px',
            lineHeight: 1.55
          }}
        >
          {description}
        </small>
      </span>

      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: '42px',
          height: '24px',
          minWidth: '42px',
          alignItems: 'center',
          border: checked
            ? '1px solid var(--admin-accent)'
            : '1px solid var(--admin-border-strong)',
          borderRadius: '999px',
          background: checked
            ? 'var(--admin-accent)'
            : 'var(--admin-surface-muted)'
        }}
      >
        <input
          type="checkbox"
          name={name}
          checked={Boolean(checked)}
          onChange={onChange}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none'
          }}
        />

        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: checked ? '21px' : '3px',
            width: '17px',
            height: '17px',
            borderRadius: '50%',
            background: checked
              ? '#0a111b'
              : 'var(--admin-text-secondary)',
            boxShadow: '0 2px 8px rgba(0,0,0,.2)',
            transition: 'left .18s ease'
          }}
        />
      </span>
    </label>
  );
}

function InformationCard({
  label,
  value,
  detail
}) {
  return (
    <article
      style={{
        minWidth: 0,
        border: '1px solid var(--admin-border)',
        borderRadius: '12px',
        padding: '13px 14px',
        background: 'var(--admin-surface-soft)'
      }}
    >
      <span
        style={{
          display: 'block',
          color: 'var(--admin-text-muted)',
          fontSize: '7px',
          fontWeight: 800,
          letterSpacing: '.09em',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </span>

      <strong
        style={{
          display: 'block',
          marginTop: '5px',
          overflow: 'hidden',
          color: 'var(--admin-text)',
          fontSize: '11px',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {value}
      </strong>

      <small
        style={{
          display: 'block',
          marginTop: '3px',
          color: 'var(--admin-text-muted)',
          fontSize: '7px'
        }}
      >
        {detail}
      </small>
    </article>
  );
}

function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  danger = false,
  onCancel,
  onConfirm
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
        background: 'rgba(2, 6, 12, .72)',
        backdropFilter: 'blur(9px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: 'min(440px, 100%)',
          border: '1px solid var(--admin-border-strong)',
          borderRadius: '20px',
          padding: '24px',
          background: 'var(--admin-surface)',
          color: 'var(--admin-text)',
          boxShadow: '0 30px 100px rgba(0,0,0,.4)'
        }}
      >
        <span
          style={{
            display: 'block',
            color: danger
              ? 'var(--admin-danger)'
              : 'var(--admin-accent)',
            fontSize: '7px',
            fontWeight: 900,
            letterSpacing: '.15em',
            textTransform: 'uppercase'
          }}
        >
          Confirmación
        </span>

        <h3
          style={{
            margin: '7px 0 0',
            color: 'var(--admin-text)',
            fontSize: '19px'
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: '10px 0 0',
            color: 'var(--admin-text-secondary)',
            fontSize: '9px',
            lineHeight: 1.65
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '22px'
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: '39px',
              border: '1px solid var(--admin-border)',
              borderRadius: '10px',
              padding: '0 14px',
              background: 'var(--admin-surface-soft)',
              color: 'var(--admin-text-secondary)',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              minHeight: '39px',
              border: danger
                ? '1px solid var(--admin-danger)'
                : '1px solid var(--admin-accent)',
              borderRadius: '10px',
              padding: '0 15px',
              background: danger
                ? 'var(--admin-danger)'
                : 'var(--admin-accent)',
              color: danger ? '#fff' : '#0a111b',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsSection({
  settings = {},
  businessName = 'BodaSync',
  defaultMessage = '',
  adminThemeMode = 'light',
  defaultThemeMode = 'light',
  allowThemeToggle = true,
  lastSavedAt = '',
  hasUnsavedChanges = false,
  updateSetting,
  handleSettingChange,
  handleBusinessNameChange,
  handleDefaultMessageChange,
  handleSaveSettings,
  resetSettings,
  reloadSettings
}) {
  const isTablet = useMediaQuery('(max-width: 920px)');
  const isPhone = useMediaQuery('(max-width: 620px)');

  const realAdminMode = normalizeMode(
    settings.adminThemeMode,
    normalizeMode(adminThemeMode)
  );

  const realInvitationMode = normalizeMode(
    settings.defaultThemeMode,
    normalizeMode(defaultThemeMode)
  );

  /*
   * ========================================================
   * ESTADO VISUAL LOCAL
   * ========================================================
   *
   * Esto hace que el check cambie INMEDIATAMENTE al hacer clic.
   */

  const [selectedAdminMode, setSelectedAdminMode] =
    useState(realAdminMode);

  const [selectedInvitationMode, setSelectedInvitationMode] =
    useState(realInvitationMode);

  const [confirmation, setConfirmation] = useState(null);

  /*
   * Si cargamos/restauramos ajustes desde fuera,
   * sincronizamos los controles.
   */

  useEffect(() => {
    setSelectedAdminMode(realAdminMode);
  }, [realAdminMode]);

  useEffect(() => {
    setSelectedInvitationMode(realInvitationMode);
  }, [realInvitationMode]);

  const currentSettings = {
    sidebarSubtitle:
      settings.sidebarSubtitle || 'Gestión de invitaciones',

    defaultGuestBookTitle:
      settings.defaultGuestBookTitle || 'Libro de firmas',

    allowThemeToggle:
      typeof settings.allowThemeToggle === 'boolean'
        ? settings.allowThemeToggle
        : allowThemeToggle,

    confirmBeforeDelete:
      settings.confirmBeforeDelete !== false,

    confirmBeforeReset:
      settings.confirmBeforeReset !== false,

    openCreatedInvitation: Boolean(
      settings.openCreatedInvitation
    ),

    compactSidebar: Boolean(settings.compactSidebar)
  };

  const safeBrand = cleanText(businessName) || 'BodaSync';

  const safeSubtitle =
    cleanText(currentSettings.sidebarSubtitle) ||
    'Gestión de invitaciones';

  /*
   * ========================================================
   * CAMBIO DE TEMA DEL ADMIN
   * ========================================================
   */

  function selectAdminTheme(mode) {
    const nextMode = normalizeMode(mode);

    /*
     * 1. Cambiamos la selección visual inmediatamente.
     */
    setSelectedAdminMode(nextMode);

    /*
     * 2. Actualizamos el hook.
     */
    updateSetting?.('adminThemeMode', nextMode);

    /*
     * 3. Aplicamos inmediatamente el tema al root.
     *
     * Esto evita esperar a que AdminDashboard haga otro render.
     */
    if (typeof document !== 'undefined') {
      const dashboard =
        document.querySelector('.admin-dashboard');

      dashboard?.setAttribute(
        'data-admin-theme',
        nextMode
      );
    }
  }

  /*
   * ========================================================
   * CAMBIO DE TEMA INICIAL DE INVITACIONES
   * ========================================================
   */

  function selectInvitationTheme(mode) {
    const nextMode = normalizeMode(mode);

    setSelectedInvitationMode(nextMode);

    updateSetting?.(
      'defaultThemeMode',
      nextMode
    );
  }

  function changeSetting(name, value) {
    updateSetting?.(name, value);
  }

  function handleToggle(event) {
    if (typeof handleSettingChange === 'function') {
      handleSettingChange(event);
      return;
    }

    const {
      name,
      checked
    } = event.target;

    changeSetting(name, checked);
  }

  function handleSubmit(event) {
    event.preventDefault();

    /*
     * Volvemos a asegurar que ambos valores actuales están
     * dentro del hook antes de guardar.
     */
    updateSetting?.(
      'adminThemeMode',
      selectedAdminMode
    );

    updateSetting?.(
      'defaultThemeMode',
      selectedInvitationMode
    );

    /*
     * Dejamos que React procese esos cambios antes de ejecutar
     * el guardado.
     */
    window.setTimeout(() => {
      handleSaveSettings?.();
    }, 0);
  }

  function requestDiscard() {
    if (!hasUnsavedChanges) {
      return;
    }

    setConfirmation('discard');
  }

  function requestReset() {
    if (!currentSettings.confirmBeforeReset) {
      resetSettings?.();
      return;
    }

    setConfirmation('reset');
  }

  function closeConfirmation() {
    setConfirmation(null);
  }

  function confirmAction() {
    if (confirmation === 'discard') {
      reloadSettings?.();
    }

    if (confirmation === 'reset') {
      resetSettings?.();
    }

    setConfirmation(null);
  }

  return (
    <section
      style={{
        display: 'grid',
        width: '100%',
        maxWidth: '1180px',
        margin: '0 auto',
        gap: '20px',
        paddingBottom: '30px'
      }}
    >
      {/* HEADER */}

      <header
        style={{
          display: 'flex',
          alignItems: isTablet ? 'stretch' : 'flex-end',
          justifyContent: 'space-between',
          flexDirection: isTablet ? 'column' : 'row',
          gap: '18px'
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              marginBottom: '7px',
              color: 'var(--admin-accent)',
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.17em',
              textTransform: 'uppercase'
            }}
          >
            Configuración del estudio
          </span>

          <h1
            style={{
              margin: 0,
              color: 'var(--admin-text)',
              fontSize: isPhone ? '28px' : '38px',
              fontWeight: 720,
              lineHeight: 1.05
            }}
          >
            Ajustes
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '10px 0 0',
              color: 'var(--admin-text-secondary)',
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Personaliza el administrador, las nuevas invitaciones y
            el comportamiento de tu espacio de trabajo.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid var(--admin-border)',
            borderRadius: '12px',
            padding: '9px 12px',
            background: 'var(--admin-surface)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: hasUnsavedChanges
                ? 'var(--admin-warning)'
                : 'var(--admin-success)'
            }}
          />

          <div>
            <strong
              style={{
                display: 'block',
                color: 'var(--admin-text)',
                fontSize: '8px'
              }}
            >
              {hasUnsavedChanges
                ? 'Cambios pendientes'
                : 'Todo guardado'}
            </strong>

            <small
              style={{
                color: 'var(--admin-text-muted)',
                fontSize: '7px'
              }}
            >
              {formatSavedAt(lastSavedAt)}
            </small>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gap: '16px'
        }}
      >
        {/* IDENTIDAD */}

        <SettingsCard
          eyebrow="Identidad"
          title="Tu espacio de trabajo"
          description="Controla el nombre y el texto que aparecen en el menú lateral."
          icon="B"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isTablet
                ? '1fr'
                : 'repeat(2, minmax(0, 1fr))',
              gap: '18px'
            }}
          >
            <Field
              label="Nombre del panel"
              name="businessName"
              value={businessName}
              onChange={handleBusinessNameChange}
              maxLength={60}
              required
            />

            <Field
              label="Descripción del panel"
              name="sidebarSubtitle"
              value={currentSettings.sidebarSubtitle}
              onChange={(event) =>
                changeSetting(
                  'sidebarSubtitle',
                  event.target.value
                )
              }
              maxLength={80}
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '13px',
              marginTop: '18px',
              border: '1px solid var(--admin-border)',
              borderRadius: '13px',
              padding: '13px 15px',
              background: 'var(--admin-surface-soft)'
            }}
          >
            <span
              style={{
                display: 'grid',
                width: '38px',
                height: '38px',
                placeItems: 'center',
                borderRadius: '11px',
                background: '#09111d',
                color: 'var(--admin-accent)',
                fontWeight: 900
              }}
            >
              {safeBrand.charAt(0)}
            </span>

            <div>
              <strong
                style={{
                  display: 'block',
                  color: 'var(--admin-text)',
                  fontSize: '10px'
                }}
              >
                {safeBrand}
              </strong>

              <small
                style={{
                  color: 'var(--admin-text-muted)',
                  fontSize: '7px'
                }}
              >
                {safeSubtitle}
              </small>
            </div>
          </div>
        </SettingsCard>

        {/* TEMA ADMIN */}

        <SettingsCard
          eyebrow="Apariencia"
          title="Tema del administrador"
          description="Cambia solamente el panel administrativo."
          icon="◐"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isPhone
                ? '1fr'
                : 'repeat(2, minmax(0, 1fr))',
              gap: '10px'
            }}
          >
            <ThemeChoice
              active={selectedAdminMode === 'light'}
              icon="☀"
              title="Modo claro"
              description="Blanco, marfil y detalles champagne."
              onClick={() => {
                selectAdminTheme('light');
              }}
            />

            <ThemeChoice
              active={selectedAdminMode === 'dark'}
              icon="☾"
              title="Modo nocturno"
              description="Navy profundo, negro y acentos dorados."
              onClick={() => {
                selectAdminTheme('dark');
              }}
            />
          </div>
        </SettingsCard>

        {/* CONTENIDO */}

        <SettingsCard
          eyebrow="Contenido predeterminado"
          title="Nuevas invitaciones"
          description="Textos iniciales para cada nueva boda."
          icon="♡"
        >
          <div
            style={{
              display: 'grid',
              gap: '17px'
            }}
          >
            <Field
              label="Mensaje de bienvenida"
              name="defaultMessage"
              value={defaultMessage}
              onChange={handleDefaultMessageChange}
              maxLength={700}
              textarea
              required
            />

            <Field
              label="Título predeterminado del libro de firmas"
              name="defaultGuestBookTitle"
              value={currentSettings.defaultGuestBookTitle}
              onChange={(event) =>
                changeSetting(
                  'defaultGuestBookTitle',
                  event.target.value
                )
              }
              maxLength={80}
              required
            />
          </div>
        </SettingsCard>

        {/* TEMA INVITACIÓN */}

        <SettingsCard
          eyebrow="Tema inicial"
          title="Apariencia de nuevas invitaciones"
          description="Selecciona cómo comienza una nueva invitación."
          icon="◇"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isPhone
                ? '1fr'
                : 'repeat(2, minmax(0, 1fr))',
              gap: '10px'
            }}
          >
            <ThemeChoice
              active={selectedInvitationMode === 'light'}
              icon="☀"
              title="Invitación clara"
              description="Utiliza la paleta seleccionada."
              onClick={() => {
                selectInvitationTheme('light');
              }}
            />

            <ThemeChoice
              active={selectedInvitationMode === 'dark'}
              icon="☾"
              title="Invitación nocturna"
              description="Negro y dorado BodaSync."
              onClick={() => {
                selectInvitationTheme('dark');
              }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <ToggleRow
              name="allowThemeToggle"
              checked={currentSettings.allowThemeToggle}
              title="Permitir cambiar entre claro y nocturno"
              description="El invitado podrá cambiar el tema."
              onChange={handleToggle}
            />
          </div>
        </SettingsCard>

        {/* COMPORTAMIENTO */}

        <SettingsCard
          eyebrow="Comportamiento"
          title="Preferencias del administrador"
          description="Controla las confirmaciones y automatizaciones."
          icon="⚙"
        >
          <ToggleRow
            name="confirmBeforeDelete"
            checked={currentSettings.confirmBeforeDelete}
            title="Confirmar antes de eliminar"
            description="Evita eliminar invitaciones accidentalmente."
            onChange={handleToggle}
          />

          <ToggleRow
            name="confirmBeforeReset"
            checked={currentSettings.confirmBeforeReset}
            title="Confirmar antes de limpiar o restaurar"
            description="Solicita confirmación antes de descartar información."
            onChange={handleToggle}
          />

          <ToggleRow
            name="openCreatedInvitation"
            checked={currentSettings.openCreatedInvitation}
            title="Abrir la invitación al crearla"
            description="Abre automáticamente el enlace publicado."
            onChange={handleToggle}
          />

          <ToggleRow
            name="compactSidebar"
            checked={currentSettings.compactSidebar}
            title="Menú lateral compacto"
            description="Reduce el menú lateral."
            onChange={handleToggle}
          />
        </SettingsCard>

        {/* INFORMACIÓN */}

        <SettingsCard
          eyebrow="Almacenamiento"
          title="Configuración local"
          description="Los ajustes se guardan en este navegador."
          icon="⌁"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isPhone
                ? 'repeat(2, minmax(0, 1fr))'
                : 'repeat(4, minmax(0, 1fr))',
              gap: '9px'
            }}
          >
            <InformationCard
              label="Panel"
              value={safeBrand}
              detail="Identidad actual"
            />

            <InformationCard
              label="Apariencia"
              value={
                selectedAdminMode === 'dark'
                  ? 'Nocturna'
                  : 'Clara'
              }
              detail="Administrador"
            />

            <InformationCard
              label="Invitaciones"
              value={
                selectedInvitationMode === 'dark'
                  ? 'Nocturnas'
                  : 'Claras'
              }
              detail="Tema inicial"
            />

            <InformationCard
              label="Estado"
              value={
                hasUnsavedChanges
                  ? 'Pendiente'
                  : 'Guardado'
              }
              detail="Configuración"
            />
          </div>
        </SettingsCard>

        {/* BOTONES */}

        <footer
          style={{
            display: 'flex',
            alignItems: isTablet ? 'stretch' : 'center',
            justifyContent: 'space-between',
            flexDirection: isTablet ? 'column' : 'row',
            gap: '12px',
            border: '1px solid var(--admin-border)',
            borderRadius: '15px',
            padding: '13px 14px',
            background: 'var(--admin-surface)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '7px'
            }}
          >
            <button
              type="button"
              disabled={!hasUnsavedChanges}
              onClick={requestDiscard}
            >
              Descartar cambios
            </button>

            <button
              type="button"
              onClick={requestReset}
              style={{
                color: 'var(--admin-danger)'
              }}
            >
              Restaurar valores
            </button>
          </div>

          <button
            type="submit"
            disabled={!hasUnsavedChanges}
            style={{
              minHeight: '40px',
              border: '1px solid var(--admin-accent)',
              borderRadius: '10px',
              padding: '0 17px',
              background: hasUnsavedChanges
                ? 'var(--admin-accent)'
                : 'var(--admin-surface-muted)',
              color: hasUnsavedChanges
                ? '#0a111b'
                : 'var(--admin-text-muted)',
              fontWeight: 800,
              cursor: hasUnsavedChanges
                ? 'pointer'
                : 'not-allowed'
            }}
          >
            {hasUnsavedChanges
              ? 'Guardar cambios'
              : 'Todo guardado'}
          </button>
        </footer>
      </form>

      <ConfirmationDialog
        open={confirmation === 'discard'}
        title="¿Descartar los cambios?"
        message="Se recuperará la última configuración guardada."
        confirmLabel="Descartar cambios"
        onCancel={closeConfirmation}
        onConfirm={confirmAction}
      />

      <ConfirmationDialog
        open={confirmation === 'reset'}
        title="¿Restaurar los valores predeterminados?"
        message="El administrador volverá a los valores iniciales de BodaSync."
        confirmLabel="Restaurar valores"
        danger
        onCancel={closeConfirmation}
        onConfirm={confirmAction}
      />
    </section>
  );
}