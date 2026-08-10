import React from 'react';

function SettingStatus({ hasUnsavedChanges }) {
  return (
    <span
      className={
        hasUnsavedChanges
          ? 'status-badge warning'
          : 'status-badge enabled'
      }
    >
      {hasUnsavedChanges ? 'Cambios sin guardar' : 'Configuración guardada'}
    </span>
  );
}

export default function SettingsSection({
  businessName = 'BodaSync',
  defaultMessage = '',
  hasUnsavedChanges = false,
  handleBusinessNameChange,
  handleDefaultMessageChange,
  handleSaveSettings,
  resetSettings,
  reloadSettings
}) {
  const businessNameLength = businessName.length;
  const defaultMessageLength = defaultMessage.length;

  function handleSubmit(event) {
    event.preventDefault();

    if (typeof handleSaveSettings === 'function') {
      handleSaveSettings(event);
    }
  }

  function handleReset() {
    if (typeof resetSettings !== 'function') {
      return;
    }

    const shouldReset = window.confirm(
      '¿Deseas restaurar la configuración predeterminada del administrador?'
    );

    if (shouldReset) {
      resetSettings();
    }
  }

  function handleReload() {
    if (typeof reloadSettings !== 'function') {
      return;
    }

    if (hasUnsavedChanges) {
      const shouldReload = window.confirm(
        'Hay cambios sin guardar. ¿Deseas descartarlos y cargar la última configuración guardada?'
      );

      if (!shouldReload) {
        return;
      }
    }

    reloadSettings();
  }

  return (
    <section className="dashboard-section settings-section">
      <div className="dashboard-page-header">
        <div>
          <span className="section-eyebrow">Configuración</span>

          <h1>Ajustes del administrador</h1>

          <p>
            Personaliza el nombre del sistema y el mensaje que aparecerá
            automáticamente al comenzar una nueva invitación.
          </p>
        </div>

        <SettingStatus hasUnsavedChanges={hasUnsavedChanges} />
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="section-eyebrow">Identidad</span>
              <h2>Nombre del administrador</h2>
              <p>
                Este nombre aparecerá en la barra lateral y en la cabecera del
                constructor de invitaciones.
              </p>
            </div>

            <span className="settings-card-icon" aria-hidden="true">
              B
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="businessName">
              Nombre del sistema
              <span className="required-mark" aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="businessName"
              name="businessName"
              type="text"
              value={businessName}
              onChange={handleBusinessNameChange}
              placeholder="Ejemplo: BodaSync"
              autoComplete="organization"
              maxLength={60}
              required
            />

            <div className="field-counter">
              <small>
                Utiliza un nombre breve que identifique tu plataforma.
              </small>

              <span>{businessNameLength}/60</span>
            </div>
          </div>

          <div className="settings-preview-card">
            <span>Vista previa</span>

            <div className="settings-brand-preview">
              <span className="brand-mark" aria-hidden="true">
                {businessName.trim().charAt(0).toUpperCase() || 'B'}
              </span>

              <div>
                <strong>{businessName.trim() || 'BodaSync'}</strong>
                <small>Gestión de eventos</small>
              </div>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <span className="section-eyebrow">Contenido predeterminado</span>
              <h2>Mensaje de bienvenida</h2>
              <p>
                Este texto se colocará automáticamente cuando comiences una
                nueva invitación. Podrás modificarlo de manera individual para
                cada pareja.
              </p>
            </div>

            <span className="settings-card-icon" aria-hidden="true">
              ♡
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="defaultMessage">
              Mensaje predeterminado
              <span className="required-mark" aria-hidden="true">
                *
              </span>
            </label>

            <textarea
              id="defaultMessage"
              name="defaultMessage"
              rows={7}
              value={defaultMessage}
              onChange={handleDefaultMessageChange}
              placeholder="Escribe el mensaje que se utilizará al comenzar una nueva invitación."
              maxLength={700}
              required
            />

            <div className="field-counter">
              <small>
                El mensaje puede personalizarse posteriormente desde la pestaña
                de información general.
              </small>

              <span>{defaultMessageLength}/700</span>
            </div>
          </div>

          <div className="settings-message-preview">
            <span>Así se mostrará inicialmente</span>

            <blockquote>
              {defaultMessage.trim() ||
                'Aquí aparecerá el mensaje predeterminado de bienvenida.'}
            </blockquote>
          </div>
        </section>

        <section className="settings-card settings-storage-card">
          <div className="settings-card-header">
            <div>
              <span className="section-eyebrow">Almacenamiento local</span>
              <h2>Información de configuración</h2>
              <p>
                Estos ajustes se guardan en el navegador utilizado para
                administrar las invitaciones.
              </p>
            </div>

            <span className="settings-card-icon" aria-hidden="true">
              ⚙
            </span>
          </div>

          <div className="settings-information-grid">
            <article>
              <span>Nombre actual</span>
              <strong>{businessName.trim() || 'BodaSync'}</strong>
            </article>

            <article>
              <span>Longitud del mensaje</span>
              <strong>{defaultMessageLength} caracteres</strong>
            </article>

            <article>
              <span>Estado</span>
              <strong>
                {hasUnsavedChanges ? 'Cambios pendientes' : 'Sincronizado'}
              </strong>
            </article>

            <article>
              <span>Ubicación</span>
              <strong>Navegador actual</strong>
            </article>
          </div>

          <div className="inline-notice">
            La configuración se guarda solamente en este navegador. Si abres el
            panel desde otro dispositivo, será necesario configurar nuevamente
            estos valores.
          </div>
        </section>

        <div className="settings-actions">
          <div className="settings-secondary-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleReload}
            >
              Descartar cambios
            </button>

            <button
              type="button"
              className="danger-button"
              onClick={handleReset}
            >
              Restaurar valores
            </button>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? 'Guardar configuración' : 'Todo guardado'}
          </button>
        </div>
      </form>
    </section>
  );
}