import React from 'react';

const NAVIGATION_ITEMS = [
  {
    key: 'create',
    label: 'Crear invitación',
    description: 'Diseña una nueva boda',
    icon: '＋'
  },
  {
    key: 'events',
    label: 'Mis eventos',
    description: 'Consulta tus invitaciones',
    icon: '♡'
  },
  {
    key: 'settings',
    label: 'Ajustes',
    description: 'Configura el administrador',
    icon: '⚙'
  }
];

export default function DashboardSidebar({
  activeSection = 'create',
  businessName = 'BodaSync',
  eventsCount = 0,
  onSectionChange
}) {
  function handleSectionChange(sectionKey) {
    if (typeof onSectionChange === 'function') {
      onSectionChange(sectionKey);
    }
  }

  function handleKeyboardNavigation(event, sectionKey) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      handleSectionChange(sectionKey);
    }
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <span
            className="brand-mark"
            aria-hidden="true"
          >
            B
          </span>

          <div className="brand-content">
            <strong>
              {businessName || 'BodaSync'}
            </strong>

            <span>
              Gestión de eventos
            </span>
          </div>
        </div>

        <nav
          className="sidebar-navigation"
          aria-label="Navegación del administrador"
        >
          {NAVIGATION_ITEMS.map((item) => {
            const isActive =
              activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`sidebar-navigation-item ${
                  isActive ? 'active' : ''
                }`}
                onClick={() =>
                  handleSectionChange(item.key)
                }
                onKeyDown={(event) =>
                  handleKeyboardNavigation(
                    event,
                    item.key
                  )
                }
                aria-current={
                  isActive ? 'page' : undefined
                }
              >
                <span
                  className="sidebar-navigation-icon"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                <span className="sidebar-navigation-content">
                  <strong>
                    {item.label}
                  </strong>

                  <small>
                    {item.description}
                  </small>
                </span>

                {item.key === 'events' &&
                  eventsCount > 0 && (
                    <span
                      className="sidebar-event-count"
                      aria-label={`${eventsCount} eventos`}
                    >
                      {eventsCount > 99
                        ? '99+'
                        : eventsCount}
                    </span>
                  )}

                <span
                  className="sidebar-navigation-arrow"
                  aria-hidden="true"
                >
                  ›
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span
            className="sidebar-status-dot"
            aria-hidden="true"
          />

          <div>
            <strong>
              Panel administrativo
            </strong>

            <span>
              Sistema activo
            </span>
          </div>
        </div>

        <p className="sidebar-version">
          BodaSync · Constructor de invitaciones
        </p>
      </div>
    </aside>
  );
}