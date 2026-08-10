import React from 'react';

function CreateIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />

      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.15.37.37.7.65.97.28.27.65.42 1.04.43H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7.5 5 5 5-5 5" />
    </svg>
  );
}

const NAVIGATION_ITEMS = [
  {
    key: 'create',
    label: 'Crear invitación',
    description: 'Diseña una nueva boda',
    icon: CreateIcon
  },
  {
    key: 'events',
    label: 'Mis eventos',
    description: 'Administra tus invitaciones',
    icon: EventsIcon
  },
  {
    key: 'settings',
    label: 'Ajustes',
    description: 'Personaliza tu espacio',
    icon: SettingsIcon
  }
];

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim() || fallback;
}

function EventCounter({ count, compact = false }) {
  if (!count || count <= 0) {
    return null;
  }

  const displayCount = compact
    ? count > 9
      ? '9+'
      : count
    : count > 99
      ? '99+'
      : count;

  return (
    <span
      className={
        compact
          ? 'sidebar-compact-counter'
          : 'sidebar-event-count'
      }
      aria-label={`${count} invitaciones`}
    >
      {displayCount}
    </span>
  );
}

export default function DashboardSidebar({
  activeSection = 'create',
  businessName = 'BodaSync',
  sidebarSubtitle = 'Gestión de invitaciones',
  eventsCount = 0,
  compactSidebar = false,
  hasUnsavedChanges = false,
  onSectionChange
}) {
  const safeBusinessName = cleanText(
    businessName,
    'BodaSync'
  );

  const safeSubtitle = cleanText(
    sidebarSubtitle,
    'Gestión de invitaciones'
  );

  const brandInitial =
    safeBusinessName.charAt(0).toUpperCase() || 'B';

  function handleSectionChange(sectionKey) {
    if (typeof onSectionChange === 'function') {
      onSectionChange(sectionKey);
    }
  }

  return (
    <aside
      className={`dashboard-sidebar ${
        compactSidebar
          ? 'dashboard-sidebar-compact'
          : ''
      }`}
      aria-label="Menú principal del administrador"
    >
      <div className="sidebar-top">
        {/* =====================================================
            IDENTIDAD
        ====================================================== */}

        <header
          className={`sidebar-brand-row ${
            compactSidebar ? 'compact' : ''
          }`}
        >
          <div
            className="brand-mark"
            title={
              compactSidebar
                ? safeBusinessName
                : undefined
            }
            aria-hidden="true"
          >
            {brandInitial}
          </div>

          {!compactSidebar && (
            <div className="brand-content">
              <strong className="brand-name">
                {safeBusinessName}
              </strong>

              <span className="brand-subtitle">
                {safeSubtitle}
              </span>
            </div>
          )}
        </header>

        {!compactSidebar && (
          <>
            <div
              className="sidebar-brand-separator"
              aria-hidden="true"
            />

            <div className="sidebar-workspace-heading">
              <span>Espacio de trabajo</span>

              <span
                className="sidebar-workspace-line"
                aria-hidden="true"
              />
            </div>
          </>
        )}

        {/* =====================================================
            NAVEGACIÓN
        ====================================================== */}

        <nav
          className="sidebar-navigation"
          aria-label="Navegación del administrador"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const isActive =
              activeSection === item.key;

            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                title={
                  compactSidebar
                    ? item.label
                    : undefined
                }
                aria-label={item.label}
                aria-current={
                  isActive
                    ? 'page'
                    : undefined
                }
                className={`sidebar-navigation-item ${
                  isActive ? 'active' : ''
                } ${
                  compactSidebar
                    ? 'compact'
                    : ''
                }`}
                onClick={() =>
                  handleSectionChange(item.key)
                }
              >
                {isActive && (
                  <span
                    className="sidebar-active-indicator"
                    aria-hidden="true"
                  />
                )}

                <span
                  className="sidebar-navigation-icon"
                  aria-hidden="true"
                >
                  <Icon />
                </span>

                {!compactSidebar && (
                  <>
                    <span className="sidebar-navigation-content">
                      <strong>
                        {item.label}
                      </strong>

                      <small>
                        {item.description}
                      </small>
                    </span>

                    {item.key === 'events' && (
                      <EventCounter
                        count={eventsCount}
                      />
                    )}

                    <span
                      className="sidebar-navigation-arrow"
                      aria-hidden="true"
                    >
                      <ChevronIcon />
                    </span>
                  </>
                )}

                {compactSidebar &&
                  item.key === 'events' && (
                    <EventCounter
                      count={eventsCount}
                      compact
                    />
                  )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          ESTADO DEL SISTEMA
      ====================================================== */}

      <footer
        className={`sidebar-footer ${
          compactSidebar ? 'compact' : ''
        }`}
      >
        {compactSidebar ? (
          <div
            className={`sidebar-compact-system-status ${
              hasUnsavedChanges
                ? 'pending'
                : 'online'
            }`}
            title={
              hasUnsavedChanges
                ? 'Hay cambios sin guardar'
                : 'Sistema activo'
            }
          >
            <span aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="sidebar-status">
              <span
                className={`sidebar-status-dot ${
                  hasUnsavedChanges
                    ? 'pending'
                    : ''
                }`}
                aria-hidden="true"
              />

              <div className="sidebar-status-copy">
                <strong>
                  {hasUnsavedChanges
                    ? 'Cambios pendientes'
                    : 'Panel administrativo'}
                </strong>

                <span>
                  {hasUnsavedChanges
                    ? 'Guarda tus ajustes'
                    : 'Sistema activo'}
                </span>
              </div>
            </div>

            <div className="sidebar-footer-meta">
              <span>Wedding Studio</span>

              <span
                className="sidebar-footer-separator"
                aria-hidden="true"
              />

              <span>
                {safeBusinessName}
              </span>
            </div>
          </>
        )}
      </footer>
    </aside>
  );
}