import React, { useMemo, useState } from 'react';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getEventId(event = {}) {
  return event._id || event.id || event.slug || '';
}

function getCoupleName(event = {}) {
  const groom = cleanText(event.groomName);
  const bride = cleanText(event.brideName);

  if (groom && bride) {
    return `${groom} & ${bride}`;
  }

  return groom || bride || 'Invitación sin nombre';
}

function getLocation(event = {}) {
  return (
    cleanText(event?.location?.venueName) ||
    cleanText(event?.location?.name) ||
    cleanText(event?.venue?.name) ||
    cleanText(event.venueName) ||
    cleanText(event.locationName) ||
    cleanText(event.lugar) ||
    ''
  );
}

function getAddress(event = {}) {
  return (
    cleanText(event?.location?.venueAddress) ||
    cleanText(event?.location?.address) ||
    cleanText(event?.venue?.address) ||
    cleanText(event.venueAddress) ||
    cleanText(event.address) ||
    ''
  );
}

function getDateTimestamp(event = {}) {
  const value =
    event.eventDate ||
    event.date ||
    event.weddingDate ||
    '';

  if (!value) {
    return null;
  }

  const date = new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return timestamp;
}

function getCreatedTimestamp(event = {}) {
  const value =
    event.createdAt ||
    event.updatedAt ||
    event.eventDate ||
    '';

  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function getEventStatus(event = {}) {
  const timestamp = getDateTimestamp(event);

  if (!timestamp) {
    return 'no-date';
  }

  if (timestamp < Date.now()) {
    return 'finished';
  }

  return 'upcoming';
}

function getStatusInformation(status) {
  if (status === 'upcoming') {
    return {
      label: 'Próximo evento',
      icon: '◷',
      color: 'var(--admin-success, #67c89b)',
      background:
        'var(--admin-success-soft, rgba(69,160,117,.12))'
    };
  }

  if (status === 'finished') {
    return {
      label: 'Evento finalizado',
      icon: '✓',
      color: 'var(--admin-text-muted, #707d90)',
      background:
        'var(--admin-surface-muted, #192332)'
    };
  }

  return {
    label: 'Sin fecha',
    icon: '○',
    color: 'var(--admin-warning, #d8b65f)',
    background:
      'var(--admin-warning-soft, rgba(190,145,40,.11))'
  };
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

  React.useEffect(() => {
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

    mediaQuery.addEventListener?.(
      'change',
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener?.(
        'change',
        handleChange
      );
    };
  }, [query]);

  return matches;
}

function Icon({
  type,
  size = 18
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: {
      display: 'block',
      width: size,
      height: size,
      minWidth: size,
      maxWidth: size,
      minHeight: size,
      maxHeight: size
    }
  };

  if (type === 'refresh') {
    return (
      <svg {...props}>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M18.5 9a7 7 0 0 0-11.9-2.5L5 8" />
        <path d="M5.5 15a7 7 0 0 0 11.9 2.5L19 16" />
      </svg>
    );
  }

  if (type === 'plus') {
    return (
      <svg {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (type === 'search') {
    return (
      <svg {...props}>
        <circle
          cx="11"
          cy="11"
          r="7"
        />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg {...props}>
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="2"
        />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  if (type === 'location') {
    return (
      <svg {...props}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle
          cx="12"
          cy="10"
          r="2.5"
        />
      </svg>
    );
  }

  if (type === 'link') {
    return (
      <svg {...props}>
        <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" />
        <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
      </svg>
    );
  }

  if (type === 'external') {
    return (
      <svg {...props}>
        <path d="M14 5h5v5" />
        <path d="M10 14 19 5" />
        <path d="M19 13v6H5V5h6" />
      </svg>
    );
  }

  if (type === 'copy') {
    return (
      <svg {...props}>
        <rect
          x="8"
          y="8"
          width="11"
          height="11"
          rx="2"
        />
        <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
      </svg>
    );
  }

  if (type === 'trash') {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="M7 7l1 13h8l1-13" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg {...props}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  return null;
}

function Metric({
  label,
  value,
  detail,
  icon
}) {
  return (
    <div
      style={{
        display: 'grid',
        minWidth: 0,
        gridTemplateColumns:
          '34px minmax(0, 1fr)',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 15px'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: '34px',
          height: '34px',
          placeItems: 'center',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '10px',
          background:
            'var(--admin-surface-soft)',
          color:
            'var(--admin-accent)',
          fontSize: '14px'
        }}
      >
        {icon}
      </span>

      <div
        style={{
          display: 'flex',
          minWidth: 0,
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '5px'
          }}
        >
          <strong
            style={{
              color:
                'var(--admin-text)',
              fontSize: '16px',
              fontWeight: 800,
              lineHeight: 1
            }}
          >
            {value}
          </strong>

          <span
            style={{
              color:
                'var(--admin-text-secondary)',
              fontSize: '9px',
              fontWeight: 700
            }}
          >
            {label}
          </span>
        </div>

        <small
          style={{
            color:
              'var(--admin-text-muted)',
            fontSize: '7px'
          }}
        >
          {detail}
        </small>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'grid',
        minHeight: '300px',
        placeItems: 'center',
        border:
          '1px solid var(--admin-border)',
        borderRadius: '18px',
        background:
          'var(--admin-surface)'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color:
            'var(--admin-text-secondary)'
        }}
      >
        <span
          style={{
            width: '32px',
            height: '32px',
            border:
              '3px solid var(--admin-border)',
            borderTopColor:
              'var(--admin-accent)',
            borderRadius: '50%'
          }}
        />

        <strong
          style={{
            fontSize: '10px'
          }}
        >
          Cargando invitaciones...
        </strong>
      </div>
    </div>
  );
}

function EmptyState({
  filtered = false,
  onCreateNew
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '330px',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border:
          '1px dashed var(--admin-border-strong)',
        borderRadius: '18px',
        padding: '32px',
        background:
          'var(--admin-surface-soft)',
        textAlign: 'center'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          width: '52px',
          height: '52px',
          marginBottom: '16px',
          placeItems: 'center',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '16px',
          background:
            'var(--admin-surface)',
          color:
            'var(--admin-accent)'
        }}
      >
        <Icon
          type="heart"
          size={20}
        />
      </span>

      <h3
        style={{
          margin: 0,
          color:
            'var(--admin-text)',
          fontSize: '17px',
          fontWeight: 700
        }}
      >
        {filtered
          ? 'No encontramos invitaciones'
          : 'Todavía no hay invitaciones'}
      </h3>

      <p
        style={{
          maxWidth: '420px',
          margin: '8px 0 0',
          color:
            'var(--admin-text-secondary)',
          fontSize: '9px',
          lineHeight: 1.65
        }}
      >
        {filtered
          ? 'Prueba con otra búsqueda o cambia los filtros.'
          : 'Crea tu primera invitación y aparecerá automáticamente en esta sección.'}
      </p>

      {!filtered &&
        typeof onCreateNew ===
          'function' && (
          <button
            type="button"
            onClick={onCreateNew}
            style={{
              display: 'inline-flex',
              minHeight: '40px',
              alignItems: 'center',
              justifyContent:
                'center',
              gap: '7px',
              marginTop: '18px',
              border:
                '1px solid var(--admin-accent)',
              borderRadius: '11px',
              padding: '0 15px',
              background:
                'var(--admin-accent)',
              color: '#0a111b',
              fontSize: '9px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Icon
              type="plus"
              size={14}
            />

            Crear invitación
          </button>
        )}
    </div>
  );
}

export default function EventsSection({
  events = [],
  loadingEvents = false,
  deletingEventId = '',
  loadEvents,
  handleDelete,
  copyWeddingUrl,
  getWeddingUrl,
  formatDate,
  onCreateNew
}) {
  const isTablet = useMediaQuery(
    '(max-width: 980px)'
  );

  const isPhone = useMediaQuery(
    '(max-width: 620px)'
  );

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [sortOrder, setSortOrder] =
    useState('recent');

  const normalizedEvents =
    Array.isArray(events)
      ? events
      : [];

  const statistics = useMemo(() => {
    return normalizedEvents.reduce(
      (result, event) => {
        const status =
          getEventStatus(event);

        result.total += 1;

        if (status === 'upcoming') {
          result.upcoming += 1;
        }

        if (status === 'finished') {
          result.finished += 1;
        }

        if (status === 'no-date') {
          result.noDate += 1;
        }

        return result;
      },
      {
        total: 0,
        upcoming: 0,
        finished: 0,
        noDate: 0
      }
    );
  }, [normalizedEvents]);

  const visibleEvents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const result =
      normalizedEvents.filter(
        (event) => {
          const status =
            getEventStatus(event);

          if (
            statusFilter !== 'all' &&
            status !== statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchableText = [
            getCoupleName(event),
            event.groomName,
            event.brideName,
            event.slug,
            event._id,
            event.id,
            getLocation(event),
            getAddress(event)
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return searchableText.includes(
            query
          );
        }
      );

    result.sort((first, second) => {
      if (sortOrder === 'oldest') {
        return (
          getCreatedTimestamp(first) -
          getCreatedTimestamp(second)
        );
      }

      if (
        sortOrder === 'event-date'
      ) {
        const firstDate =
          getDateTimestamp(first) ??
          Number.MAX_SAFE_INTEGER;

        const secondDate =
          getDateTimestamp(second) ??
          Number.MAX_SAFE_INTEGER;

        return firstDate - secondDate;
      }

      return (
        getCreatedTimestamp(second) -
        getCreatedTimestamp(first)
      );
    });

    return result;
  }, [
    normalizedEvents,
    search,
    sortOrder,
    statusFilter
  ]);

  function resolveWeddingUrl(event) {
    if (
      typeof getWeddingUrl ===
      'function'
    ) {
      try {
        const resolvedUrl =
          getWeddingUrl(event);

        if (
          typeof resolvedUrl ===
            'string' &&
          resolvedUrl &&
          !resolvedUrl.includes(
            '[object Object]'
          )
        ) {
          return resolvedUrl;
        }
      } catch {
        // Fallback local debajo.
      }
    }

    const slug = cleanText(
      event?.slug
    );

    if (!slug) {
      return '';
    }

    if (typeof window === 'undefined') {
      return `/boda/${encodeURIComponent(
        slug
      )}`;
    }

    return `${
      window.location.origin
    }/boda/${encodeURIComponent(
      slug
    )}`;
  }

  function formatWeddingDate(event) {
    const value =
      event?.eventDate ||
      event?.date ||
      event?.weddingDate;

    if (!value) {
      return 'Sin fecha definida';
    }

    if (
      typeof formatDate ===
      'function'
    ) {
      try {
        const result =
          formatDate(value);

        if (result) {
          return result;
        }
      } catch {
        // Fallback debajo.
      }
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return String(value);
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    ).format(date);
  }

  async function handleCopy(event) {
    if (
      typeof copyWeddingUrl ===
      'function'
    ) {
      try {
        await copyWeddingUrl(event);
        return;
      } catch {
        // Si el hook falla,
        // usamos clipboard como respaldo.
      }
    }

    const url =
      resolveWeddingUrl(event);

    if (
      url &&
      typeof navigator !==
        'undefined' &&
      navigator.clipboard
    ) {
      await navigator.clipboard.writeText(
        url
      );
    }
  }

  function handleRemove(event) {
    const id = getEventId(event);

    if (
      !id ||
      typeof handleDelete !==
        'function'
    ) {
      return;
    }

    handleDelete(id);
  }

  const topButtonStyle = {
    display: 'inline-flex',
    minHeight: '41px',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border:
      '1px solid var(--admin-border)',
    borderRadius: '11px',
    padding: '0 14px',
    background:
      'var(--admin-surface)',
    color:
      'var(--admin-text-secondary)',
    fontSize: '9px',
    fontWeight: 750,
    cursor: 'pointer'
  };

  const inputStyle = {
    width: '100%',
    minHeight: '42px',
    border:
      '1px solid var(--admin-border)',
    borderRadius: '11px',
    outline: 0,
    background:
      'var(--admin-input)',
    color:
      'var(--admin-text)',
    fontSize: '9px'
  };

  return (
    <section
      className="events-premium-page"
      style={{
        display: 'grid',
        width: '100%',
        gap: '22px'
      }}
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <header
        style={{
          display: 'flex',
          alignItems: isTablet
            ? 'stretch'
            : 'flex-end',
          justifyContent:
            'space-between',
          flexDirection: isTablet
            ? 'column'
            : 'row',
          gap: '20px'
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              marginBottom: '7px',
              color:
                'var(--admin-accent)',
              fontSize: '7px',
              fontWeight: 900,
              letterSpacing: '.17em',
              textTransform: 'uppercase'
            }}
          >
            Administración
          </span>

          <h1
            style={{
              margin: 0,
              color:
                'var(--admin-text)',
              fontSize: isPhone
                ? '28px'
                : '38px',
              fontWeight: 720,
              lineHeight: 1.05,
              letterSpacing:
                '-.045em'
            }}
          >
            Mis eventos
          </h1>

          <p
            style={{
              maxWidth: '680px',
              margin: '10px 0 0',
              color:
                'var(--admin-text-secondary)',
              fontSize: '10px',
              lineHeight: 1.65
            }}
          >
            Consulta tus invitaciones,
            revisa sus enlaces públicos y
            administra cada evento desde un
            solo lugar.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <button
            type="button"
            style={topButtonStyle}
            onClick={() =>
              loadEvents?.()
            }
            disabled={loadingEvents}
          >
            <Icon
              type="refresh"
              size={14}
            />

            Actualizar
          </button>

          <button
            type="button"
            onClick={() =>
              onCreateNew?.()
            }
            style={{
              ...topButtonStyle,
              borderColor:
                'var(--admin-accent)',
              background:
                'linear-gradient(135deg, var(--admin-accent-bright), var(--admin-accent))',
              color: '#0a111b',
              fontWeight: 820
            }}
          >
            <Icon
              type="plus"
              size={14}
            />

            Crear invitación
          </button>
        </div>
      </header>

      {/* =================================================
          MÉTRICAS
      ================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPhone
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(4, minmax(0, 1fr))',
          overflow: 'hidden',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '17px',
          background:
            'var(--admin-surface)'
        }}
      >
        <Metric
          icon="▦"
          value={statistics.total}
          label="Total"
          detail="invitaciones"
        />

        <Metric
          icon="◷"
          value={statistics.upcoming}
          label="Próximos"
          detail="eventos"
        />

        <Metric
          icon="✓"
          value={statistics.finished}
          label="Finalizados"
          detail="eventos"
        />

        <Metric
          icon="○"
          value={statistics.noDate}
          label="Sin fecha"
          detail="eventos"
        />
      </div>

      {/* =================================================
          FILTROS
      ================================================== */}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: isTablet
            ? '1fr'
            : 'minmax(260px, 1fr) 170px 190px',
          gap: '11px',
          border:
            '1px solid var(--admin-border)',
          borderRadius: '16px',
          padding: '13px',
          background:
            'var(--admin-surface)'
        }}
      >
        <label
          style={{
            display: 'grid',
            gap: '6px'
          }}
        >
          <span
            style={{
              color:
                'var(--admin-text-secondary)',
              fontSize: '8px',
              fontWeight: 750
            }}
          >
            Buscar invitación
          </span>

          <div
            style={{
              position: 'relative'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '13px',
                color:
                  'var(--admin-text-muted)',
                transform:
                  'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <Icon
                type="search"
                size={14}
              />
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Pareja, lugar o identificador"
              style={{
                ...inputStyle,
                padding:
                  '0 13px 0 39px'
              }}
            />
          </div>
        </label>

        <label
          style={{
            display: 'grid',
            gap: '6px'
          }}
        >
          <span
            style={{
              color:
                'var(--admin-text-secondary)',
              fontSize: '8px',
              fontWeight: 750
            }}
          >
            Estado
          </span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={{
              ...inputStyle,
              padding: '0 11px'
            }}
          >
            <option value="all">
              Todos
            </option>

            <option value="upcoming">
              Próximos
            </option>

            <option value="finished">
              Finalizados
            </option>

            <option value="no-date">
              Sin fecha
            </option>
          </select>
        </label>

        <label
          style={{
            display: 'grid',
            gap: '6px'
          }}
        >
          <span
            style={{
              color:
                'var(--admin-text-secondary)',
              fontSize: '8px',
              fontWeight: 750
            }}
          >
            Ordenar
          </span>

          <select
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value
              )
            }
            style={{
              ...inputStyle,
              padding: '0 11px'
            }}
          >
            <option value="recent">
              Más reciente
            </option>

            <option value="event-date">
              Fecha del evento
            </option>

            <option value="oldest">
              Más antiguo
            </option>
          </select>
        </label>
      </section>

      {/* =================================================
          CONTENIDO
      ================================================== */}

      {loadingEvents ? (
        <LoadingState />
      ) : normalizedEvents.length ===
        0 ? (
        <EmptyState
          onCreateNew={onCreateNew}
        />
      ) : visibleEvents.length ===
        0 ? (
        <EmptyState filtered />
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '14px'
          }}
        >
          {visibleEvents.map(
            (event) => {
              const eventId =
                getEventId(event);

              const status =
                getEventStatus(event);

              const statusInformation =
                getStatusInformation(
                  status
                );

              const coupleName =
                getCoupleName(event);

              const location =
                getLocation(event);

              const address =
                getAddress(event);

              const url =
                resolveWeddingUrl(event);

              const deleting =
                Boolean(
                  deletingEventId &&
                    String(
                      deletingEventId
                    ) ===
                      String(eventId)
                );

              return (
                <article
                  key={eventId}
                  style={{
                    position:
                      'relative',
                    overflow:
                      'hidden',
                    border:
                      '1px solid var(--admin-border)',
                    borderRadius:
                      '18px',
                    background:
                      'linear-gradient(145deg, var(--admin-surface), var(--admin-surface-soft))',
                    boxShadow:
                      'var(--admin-shadow-xs)'
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position:
                        'absolute',
                      top: '-100px',
                      right:
                        '-100px',
                      width: '250px',
                      height: '250px',
                      borderRadius:
                        '50%',
                      background:
                        'radial-gradient(circle, var(--admin-accent-glow), transparent 70%)',
                      pointerEvents:
                        'none'
                    }}
                  />

                  <div
                    style={{
                      position:
                        'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems:
                        isTablet
                          ? 'stretch'
                          : 'flex-start',
                      justifyContent:
                        'space-between',
                      flexDirection:
                        isTablet
                          ? 'column'
                          : 'row',
                      gap: '20px',
                      padding:
                        isPhone
                          ? '18px'
                          : '22px 23px'
                    }}
                  >
                    {/* LEFT */}

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          flexWrap:
                            'wrap',
                          alignItems:
                            'center',
                          gap: '8px',
                          marginBottom:
                            '13px'
                        }}
                      >
                        <span
                          style={{
                            display:
                              'inline-flex',
                            minHeight:
                              '25px',
                            alignItems:
                              'center',
                            gap: '6px',
                            borderRadius:
                              '999px',
                            padding:
                              '0 9px',
                            background:
                              statusInformation.background,
                            color:
                              statusInformation.color,
                            fontSize:
                              '7px',
                            fontWeight:
                              800
                          }}
                        >
                          <span
                            aria-hidden="true"
                          >
                            {
                              statusInformation.icon
                            }
                          </span>

                          {
                            statusInformation.label
                          }
                        </span>

                        <span
                          style={{
                            color:
                              'var(--admin-text-muted)',
                            fontSize:
                              '7px',
                            fontWeight:
                              700,
                            letterSpacing:
                              '.08em',
                            textTransform:
                              'uppercase'
                          }}
                        >
                          Invitación de boda
                        </span>
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          color:
                            'var(--admin-text)',
                          fontSize:
                            isPhone
                              ? '19px'
                              : '23px',
                          fontWeight:
                            720,
                          letterSpacing:
                            '-.035em'
                        }}
                      >
                        {coupleName}
                      </h2>

                      <div
                        style={{
                          display:
                            'flex',
                          flexWrap:
                            'wrap',
                          gap:
                            '10px 20px',
                          marginTop:
                            '16px'
                        }}
                      >
                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              '30px minmax(0,1fr)',
                            alignItems:
                              'center',
                            gap: '9px',
                            minWidth:
                              '185px'
                          }}
                        >
                          <span
                            style={{
                              display:
                                'grid',
                              width:
                                '30px',
                              height:
                                '30px',
                              placeItems:
                                'center',
                              border:
                                '1px solid var(--admin-border)',
                              borderRadius:
                                '9px',
                              background:
                                'var(--admin-surface)',
                              color:
                                'var(--admin-accent)'
                            }}
                          >
                            <Icon
                              type="calendar"
                              size={
                                13
                              }
                            />
                          </span>

                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap:
                                '2px'
                            }}
                          >
                            <span
                              style={{
                                color:
                                  'var(--admin-text-muted)',
                                fontSize:
                                  '7px',
                                textTransform:
                                  'uppercase'
                              }}
                            >
                              Fecha
                            </span>

                            <strong
                              style={{
                                color:
                                  'var(--admin-text-secondary)',
                                fontSize:
                                  '9px',
                                fontWeight:
                                  700
                              }}
                            >
                              {formatWeddingDate(
                                event
                              )}
                            </strong>
                          </div>
                        </div>

                        {(location ||
                          address) && (
                          <div
                            style={{
                              display:
                                'grid',
                              gridTemplateColumns:
                                '30px minmax(0,1fr)',
                              alignItems:
                                'center',
                              gap: '9px',
                              minWidth:
                                '185px'
                            }}
                          >
                            <span
                              style={{
                                display:
                                  'grid',
                                width:
                                  '30px',
                                height:
                                  '30px',
                                placeItems:
                                  'center',
                                border:
                                  '1px solid var(--admin-border)',
                                borderRadius:
                                  '9px',
                                background:
                                  'var(--admin-surface)',
                                color:
                                  'var(--admin-accent)'
                              }}
                            >
                              <Icon
                                type="location"
                                size={
                                  13
                                }
                              />
                            </span>

                            <div
                              style={{
                                display:
                                  'flex',
                                minWidth:
                                  0,
                                flexDirection:
                                  'column',
                                gap:
                                  '2px'
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    'var(--admin-text-muted)',
                                  fontSize:
                                    '7px',
                                  textTransform:
                                    'uppercase'
                                }}
                              >
                                Lugar
                              </span>

                              <strong
                                style={{
                                  overflow:
                                    'hidden',
                                  color:
                                    'var(--admin-text-secondary)',
                                  fontSize:
                                    '9px',
                                  fontWeight:
                                    700,
                                  textOverflow:
                                    'ellipsis',
                                  whiteSpace:
                                    'nowrap'
                                }}
                              >
                                {location ||
                                  address}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ID */}

                    <div
                      style={{
                        width:
                          isTablet
                            ? '100%'
                            : '210px',
                        flexShrink: 0,
                        borderLeft:
                          isTablet
                            ? 0
                            : '1px solid var(--admin-border)',
                        borderTop:
                          isTablet
                            ? '1px solid var(--admin-border)'
                            : 0,
                        paddingLeft:
                          isTablet
                            ? 0
                            : '20px',
                        paddingTop:
                          isTablet
                            ? '15px'
                            : 0
                      }}
                    >
                      <span
                        style={{
                          display:
                            'block',
                          color:
                            'var(--admin-text-muted)',
                          fontSize:
                            '7px',
                          fontWeight:
                            800,
                          letterSpacing:
                            '.11em',
                          textTransform:
                            'uppercase'
                        }}
                      >
                        Identificador
                      </span>

                      <strong
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          overflowWrap:
                            'anywhere',
                          color:
                            'var(--admin-text-secondary)',
                          fontSize:
                            '9px',
                          fontWeight:
                            700
                        }}
                      >
                        {cleanText(
                          event.slug
                        ) ||
                          eventId ||
                          'Sin identificador'}
                      </strong>
                    </div>
                  </div>

                  {/* URL */}

                  {url && (
                    <div
                      style={{
                        position:
                          'relative',
                        zIndex: 1,
                        display:
                          'grid',
                        gridTemplateColumns:
                          isPhone
                            ? '1fr'
                            : '30px minmax(0, 1fr) auto',
                        alignItems:
                          'center',
                        gap: '10px',
                        borderTop:
                          '1px solid var(--admin-border)',
                        borderBottom:
                          '1px solid var(--admin-border)',
                        padding:
                          '11px 23px',
                        background:
                          'color-mix(in srgb, var(--admin-surface-soft) 72%, transparent)'
                      }}
                    >
                      <span
                        style={{
                          display:
                            'grid',
                          width: '30px',
                          height:
                            '30px',
                          placeItems:
                            'center',
                          borderRadius:
                            '9px',
                          color:
                            'var(--admin-accent)'
                        }}
                      >
                        <Icon
                          type="link"
                          size={13}
                        />
                      </span>

                      <div
                        style={{
                          minWidth: 0
                        }}
                      >
                        <span
                          style={{
                            display:
                              'block',
                            marginBottom:
                              '3px',
                            color:
                              'var(--admin-text-muted)',
                            fontSize:
                              '7px',
                            textTransform:
                              'uppercase'
                          }}
                        >
                          Enlace público
                        </span>

                        <strong
                          style={{
                            display:
                              'block',
                            overflow:
                              'hidden',
                            color:
                              'var(--admin-text-secondary)',
                            fontSize:
                              '8px',
                            fontWeight:
                              650,
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {url}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            event
                          )
                        }
                        style={{
                          display:
                            'inline-flex',
                          minHeight:
                            '31px',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          gap: '6px',
                          border:
                            '1px solid var(--admin-border)',
                          borderRadius:
                            '9px',
                          padding:
                            '0 10px',
                          background:
                            'var(--admin-surface)',
                          color:
                            'var(--admin-text-secondary)',
                          fontSize:
                            '8px',
                          fontWeight:
                            720,
                          cursor:
                            'pointer'
                        }}
                      >
                        <Icon
                          type="copy"
                          size={12}
                        />

                        Copiar
                      </button>
                    </div>
                  )}

                  {/* ACTIONS */}

                  <footer
                    style={{
                      position:
                        'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexWrap:
                        'wrap',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: '10px',
                      padding:
                        '13px 23px'
                    }}
                  >
                    <span
                      style={{
                        color:
                          'var(--admin-text-muted)',
                        fontSize:
                          '7px'
                      }}
                    >
                      Gestiona esta invitación
                      sin salir del panel.
                    </span>

                    <div
                      style={{
                        display:
                          'flex',
                        flexWrap:
                          'wrap',
                        gap:
                          '7px'
                      }}
                    >
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display:
                              'inline-flex',
                            minHeight:
                              '36px',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            gap: '7px',
                            border:
                              '1px solid var(--admin-accent)',
                            borderRadius:
                              '10px',
                            padding:
                              '0 12px',
                            background:
                              'linear-gradient(135deg, var(--admin-accent-bright), var(--admin-accent))',
                            color:
                              '#0a111b',
                            fontSize:
                              '8px',
                            fontWeight:
                              800,
                            textDecoration:
                              'none'
                          }}
                        >
                          <Icon
                            type="external"
                            size={
                              12
                            }
                          />

                          Abrir invitación
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            event
                          )
                        }
                        style={{
                          display:
                            'inline-flex',
                          minHeight:
                            '36px',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          gap: '7px',
                          border:
                            '1px solid var(--admin-border)',
                          borderRadius:
                            '10px',
                          padding:
                            '0 12px',
                          background:
                            'var(--admin-surface)',
                          color:
                            'var(--admin-text-secondary)',
                          fontSize:
                            '8px',
                          fontWeight:
                            750,
                          cursor:
                            'pointer'
                        }}
                      >
                        <Icon
                          type="copy"
                          size={12}
                        />

                        Copiar enlace
                      </button>

                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() =>
                          handleRemove(
                            event
                          )
                        }
                        style={{
                          display:
                            'inline-flex',
                          minHeight:
                            '36px',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          gap: '7px',
                          border:
                            '1px solid color-mix(in srgb, var(--admin-danger) 25%, var(--admin-border))',
                          borderRadius:
                            '10px',
                          padding:
                            '0 12px',
                          background:
                            'transparent',
                          color:
                            'var(--admin-danger)',
                          fontSize:
                            '8px',
                          fontWeight:
                            750,
                          cursor:
                            deleting
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            deleting
                              ? 0.5
                              : 1
                        }}
                      >
                        <Icon
                          type="trash"
                          size={12}
                        />

                        {deleting
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </button>
                    </div>
                  </footer>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}