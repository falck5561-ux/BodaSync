import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getEventId(event) {
  if (!event || typeof event !== 'object') {
    return '';
  }

  return cleanText(
    String(
      event._id ||
        event.id ||
        event.slug ||
        ''
    )
  );
}

function getEventSlug(event) {
  return cleanText(event?.slug);
}

function getCoupleTitle(event) {
  const groomName = cleanText(
    event?.groomName ||
      event?.novio
  );

  const brideName = cleanText(
    event?.brideName ||
      event?.novia
  );

  if (groomName && brideName) {
    return `${groomName} y ${brideName}`;
  }

  return groomName || brideName || 'Invitación';
}

function getVenueName(event) {
  return cleanText(
    event?.location?.venueName ||
      event?.venue?.name ||
      event?.venueName
  );
}

function getVenueAddress(event) {
  return cleanText(
    event?.location?.venueAddress ||
      event?.venue?.address ||
      event?.venueAddress
  );
}

function parseEventDate(value, useEndOfDay = false) {
  const dateValue = cleanText(value);

  if (!dateValue) {
    return null;
  }

  const dateOnlyMatch = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      useEndOfDay ? 23 : 12,
      useEndOfDay ? 59 : 0,
      useEndOfDay ? 59 : 0,
      useEndOfDay ? 999 : 0
    );

    return Number.isNaN(parsedDate.getTime())
      ? null
      : parsedDate;
  }

  const parsedDate = new Date(dateValue);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
}

function getEventTimestamp(event) {
  const parsedDate = parseEventDate(
    event?.eventDate ||
      event?.fecha,
    true
  );

  return parsedDate
    ? parsedDate.getTime()
    : 0;
}

function getEventStatus(event) {
  const timestamp = getEventTimestamp(event);

  if (!timestamp) {
    return {
      key: 'pending',
      label: 'Sin fecha'
    };
  }

  if (timestamp < Date.now()) {
    return {
      key: 'finished',
      label: 'Evento finalizado'
    };
  }

  return {
    key: 'upcoming',
    label: 'Próximo evento'
  };
}

function formatEventDate(dateValue, formatDate) {
  const normalizedDate = cleanText(dateValue);

  if (!normalizedDate) {
    return '';
  }

  const parsedDate = parseEventDate(normalizedDate);

  if (!parsedDate) {
    return '';
  }

  if (typeof formatDate === 'function') {
    try {
      const formattedValue = cleanText(
        formatDate(normalizedDate)
      );

      if (formattedValue) {
        return formattedValue;
      }
    } catch {
      // Usamos el formateador seguro de esta sección.
    }
  }

  const hasTime =
    /T\d{2}:\d{2}/.test(normalizedDate) ||
    /\s\d{2}:\d{2}/.test(normalizedDate);

  return new Intl.DateTimeFormat(
    'es-MX',
    hasTime
      ? {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      : {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
  ).format(parsedDate);
}

function EventStatistic({
  label,
  value,
  description
}) {
  return (
    <article className="event-statistic-card">
      <span>{label}</span>

      <strong>{value}</strong>

      {description && (
        <small>{description}</small>
      )}
    </article>
  );
}

function EventCard({
  event,
  deleting = false,
  onDelete,
  onCopy,
  getWeddingUrl,
  formatDate
}) {
  const eventId = getEventId(event);
  const slug = getEventSlug(event);
  const coupleTitle = getCoupleTitle(event);
  const status = getEventStatus(event);

  const eventDate = cleanText(
    event?.eventDate ||
      event?.fecha
  );

  const formattedDate = formatEventDate(
    eventDate,
    formatDate
  );

  const venueName = getVenueName(event);
  const venueAddress = getVenueAddress(event);

  const weddingPath = slug
    ? `/boda/${encodeURIComponent(slug)}`
    : '';

  const publicUrl =
    slug &&
    typeof getWeddingUrl === 'function'
      ? cleanText(getWeddingUrl(event))
      : '';

  const hasInformation = Boolean(
    formattedDate ||
      slug ||
      venueName ||
      venueAddress
  );

  async function handleCopy() {
    if (
      !publicUrl ||
      typeof onCopy !== 'function'
    ) {
      return;
    }

    await onCopy(event);
  }

  async function handleDelete() {
    if (
      !eventId ||
      typeof onDelete !== 'function'
    ) {
      return;
    }

    await onDelete(eventId);
  }

  return (
    <article className="event-card">
      <div className="event-card-header">
        <div className="event-card-couple">
          <span
            className="event-card-avatar"
            aria-hidden="true"
          >
            ♡
          </span>

          <div>
            <span className="event-card-label">
              Invitación de boda
            </span>

            <h3>{coupleTitle}</h3>
          </div>
        </div>

        <span
          className={`event-status-badge ${status.key}`}
        >
          {status.label}
        </span>
      </div>

      {hasInformation && (
        <div className="event-card-information">
          {formattedDate && (
            <div className="event-card-detail">
              <span>Fecha</span>

              <strong>
                {formattedDate}
              </strong>
            </div>
          )}

          {slug && (
            <div className="event-card-detail">
              <span>Identificador</span>

              <strong>{slug}</strong>
            </div>
          )}

          {venueName && (
            <div className="event-card-detail">
              <span>Lugar</span>

              <strong>
                {venueName}
              </strong>
            </div>
          )}

          {venueAddress && (
            <div className="event-card-detail">
              <span>Dirección</span>

              <strong>
                {venueAddress}
              </strong>
            </div>
          )}
        </div>
      )}

      {publicUrl && (
        <div className="event-url-box">
          <div>
            <span>Enlace público</span>

            <strong title={publicUrl}>
              {publicUrl}
            </strong>
          </div>

          <button
            type="button"
            className="copy-url-button"
            onClick={handleCopy}
          >
            Copiar
          </button>
        </div>
      )}

      <div className="event-card-actions">
        {weddingPath && (
          <Link
            className="primary-button compact-button"
            to={weddingPath}
            target="_blank"
            rel="noreferrer"
          >
            Abrir invitación
          </Link>
        )}

        {publicUrl && (
          <button
            type="button"
            className="secondary-button compact-button"
            onClick={handleCopy}
          >
            Copiar enlace
          </button>
        )}

        {eventId && (
          <button
            type="button"
            className="danger-button compact-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting
              ? 'Eliminando...'
              : 'Eliminar'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function EventsSection({
  events = [],
  loadingEvents = false,
  deletingEventId = null,
  loadEvents,
  handleDelete,
  copyWeddingUrl,
  getWeddingUrl,
  formatDate,
  onCreateNew
}) {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [sortOrder, setSortOrder] =
    useState('newest');

  const normalizedEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          event &&
          typeof event === 'object'
      )
    : [];

  const statistics = useMemo(() => {
    const now = Date.now();

    let upcoming = 0;
    let finished = 0;
    let pendingDate = 0;

    normalizedEvents.forEach((event) => {
      const timestamp =
        getEventTimestamp(event);

      if (!timestamp) {
        pendingDate += 1;
        return;
      }

      if (timestamp >= now) {
        upcoming += 1;
        return;
      }

      finished += 1;
    });

    return {
      total: normalizedEvents.length,
      upcoming,
      finished,
      pendingDate
    };
  }, [normalizedEvents]);

  const visibleEvents = useMemo(() => {
    const search = normalizeText(searchTerm);

    const filteredEvents =
      normalizedEvents.filter((event) => {
        const status =
          getEventStatus(event);

        if (
          statusFilter !== 'all' &&
          status.key !== statusFilter
        ) {
          return false;
        }

        if (!search) {
          return true;
        }

        const searchableText = normalizeText(
          [
            event?.groomName,
            event?.brideName,
            event?.novio,
            event?.novia,
            event?.slug,
            getVenueName(event),
            getVenueAddress(event)
          ].join(' ')
        );

        return searchableText.includes(search);
      });

    return [...filteredEvents].sort(
      (firstEvent, secondEvent) => {
        if (sortOrder === 'name') {
          return getCoupleTitle(
            firstEvent
          ).localeCompare(
            getCoupleTitle(secondEvent),
            'es',
            {
              sensitivity: 'base'
            }
          );
        }

        const firstTimestamp =
          getEventTimestamp(firstEvent);

        const secondTimestamp =
          getEventTimestamp(secondEvent);

        if (sortOrder === 'oldest') {
          if (!firstTimestamp) {
            return 1;
          }

          if (!secondTimestamp) {
            return -1;
          }

          return (
            firstTimestamp -
            secondTimestamp
          );
        }

        if (!firstTimestamp) {
          return 1;
        }

        if (!secondTimestamp) {
          return -1;
        }

        return (
          secondTimestamp -
          firstTimestamp
        );
      }
    );
  }, [
    normalizedEvents,
    searchTerm,
    sortOrder,
    statusFilter
  ]);

  const filtersAreActive = Boolean(
    searchTerm ||
      statusFilter !== 'all' ||
      sortOrder !== 'newest'
  );

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
  }

  function clearFilters() {
    setSearchTerm('');
    setStatusFilter('all');
    setSortOrder('newest');
  }

  async function handleRefresh() {
    if (typeof loadEvents !== 'function') {
      return;
    }

    await loadEvents();
  }

  function handleCreateNew() {
    if (typeof onCreateNew === 'function') {
      onCreateNew();
    }
  }

  return (
    <section className="dashboard-section events-section">
      <div className="dashboard-page-header">
        <div>
          <span className="section-eyebrow">
            Administración
          </span>

          <h1>Mis eventos</h1>

          <p>
            Consulta las invitaciones creadas,
            abre sus enlaces públicos o elimina
            los eventos que ya no necesites.
          </p>
        </div>

        <div className="dashboard-page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleRefresh}
            disabled={loadingEvents}
          >
            {loadingEvents
              ? 'Actualizando...'
              : 'Actualizar'}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreateNew}
          >
            + Crear invitación
          </button>
        </div>
      </div>

      <div className="events-statistics-grid">
        <EventStatistic
          label="Total"
          value={statistics.total}
          description="invitaciones"
        />

        <EventStatistic
          label="Próximos"
          value={statistics.upcoming}
          description="eventos"
        />

        <EventStatistic
          label="Finalizados"
          value={statistics.finished}
          description="eventos"
        />

        <EventStatistic
          label="Sin fecha"
          value={statistics.pendingDate}
          description="eventos"
        />
      </div>

      <div className="events-toolbar">
        <div className="events-search-field">
          <label htmlFor="eventSearch">
            Buscar invitación
          </label>

          <input
            id="eventSearch"
            type="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por pareja, lugar o identificador"
          />
        </div>

        <div className="events-filter-field">
          <label htmlFor="eventStatus">
            Estado
          </label>

          <select
            id="eventStatus"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
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

            <option value="pending">
              Sin fecha
            </option>
          </select>
        </div>

        <div className="events-filter-field">
          <label htmlFor="eventSort">
            Ordenar
          </label>

          <select
            id="eventSort"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value
              )
            }
          >
            <option value="newest">
              Fecha más reciente
            </option>

            <option value="oldest">
              Fecha más antigua
            </option>

            <option value="name">
              Nombre de la pareja
            </option>
          </select>
        </div>

        {filtersAreActive && (
          <button
            type="button"
            className="text-button events-clear-filters"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loadingEvents &&
      normalizedEvents.length === 0 ? (
        <div className="events-loading-state">
          <span
            className="loading-spinner"
            aria-hidden="true"
          />

          <strong>
            Cargando eventos
          </strong>

          <p>
            Obteniendo las invitaciones
            registradas.
          </p>
        </div>
      ) : visibleEvents.length > 0 ? (
        <div className="events-grid">
          {visibleEvents.map(
            (event, index) => {
              const eventId =
                getEventId(event);

              const eventKey =
                eventId ||
                `event-${index}`;

              return (
                <EventCard
                  key={eventKey}
                  event={event}
                  deleting={
                    Boolean(eventId) &&
                    deletingEventId ===
                      eventId
                  }
                  onDelete={handleDelete}
                  onCopy={copyWeddingUrl}
                  getWeddingUrl={
                    getWeddingUrl
                  }
                  formatDate={formatDate}
                />
              );
            }
          )}
        </div>
      ) : normalizedEvents.length === 0 ? (
        <div className="events-empty-state">
          <span
            className="events-empty-icon"
            aria-hidden="true"
          >
            ♡
          </span>

          <h2>
            Todavía no hay eventos
          </h2>

          <p>
            Crea tu primera invitación para
            que aparezca aquí.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreateNew}
          >
            Crear primera invitación
          </button>
        </div>
      ) : (
        <div className="events-empty-state">
          <span
            className="events-empty-icon"
            aria-hidden="true"
          >
            ⌕
          </span>

          <h2>
            No encontramos resultados
          </h2>

          <p>
            Ninguna invitación coincide con
            los filtros seleccionados.
          </p>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}