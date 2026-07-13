import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  createWedding,
  deleteWedding,
  getWeddings
} from '../../services/weddingService';

import './AdminDashboard.css';

const EMPTY_FORM = {
  groomName: '',
  brideName: '',
  eventDate: '',
  welcomeMessage: ''
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('create');

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [events, setEvents] = useState([]);
  const [generatedWedding, setGeneratedWedding] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState(() => ({
    businessName:
      localStorage.getItem('bodasync_business_name') || 'BodaSync',
    defaultMessage:
      localStorage.getItem('bodasync_default_message') ||
      'Nos llena de alegría compartir este momento contigo.'
  }));

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoadingEvents(true);
      const data = await getWeddings();
      setEvents(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingEvents(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setGeneratedWedding(null);

      const wedding = await createWedding(formData);

      setGeneratedWedding(wedding);
      setEvents((currentEvents) => [wedding, ...currentEvents]);

      setFormData({
        ...EMPTY_FORM,
        welcomeMessage: settings.defaultMessage
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este evento?'
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError('');
      await deleteWedding(id);

      setEvents((currentEvents) =>
        currentEvents.filter((wedding) => wedding._id !== id)
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleSaveSettings(event) {
    event.preventDefault();

    localStorage.setItem(
      'bodasync_business_name',
      settings.businessName
    );

    localStorage.setItem(
      'bodasync_default_message',
      settings.defaultMessage
    );

    setFormData((currentForm) => ({
      ...currentForm,
      welcomeMessage:
        currentForm.welcomeMessage || settings.defaultMessage
    }));

    window.alert('Los ajustes fueron guardados.');
  }

  function changeSection(section) {
    setActiveSection(section);
    setError('');

    if (section === 'events') {
      loadEvents();
    }
  }

  function formatDate(dateValue) {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(dateValue));
  }

  const generatedUrl = generatedWedding
    ? `${window.location.origin}/boda/${generatedWedding.slug}`
    : '';

  async function copyGeneratedUrl() {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      window.alert('Enlace copiado.');
    } catch {
      window.alert('No fue posible copiar el enlace.');
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>

          <div>
            <strong>{settings.businessName}</strong>
            <span>Gestión de eventos</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <button
            type="button"
            className={activeSection === 'create' ? 'active' : ''}
            onClick={() => changeSection('create')}
          >
            Crear invitación
          </button>

          <button
            type="button"
            className={activeSection === 'events' ? 'active' : ''}
            onClick={() => changeSection('events')}
          >
            Mis eventos
          </button>

          <button
            type="button"
            className={activeSection === 'settings' ? 'active' : ''}
            onClick={() => changeSection('settings')}
          >
            Ajustes
          </button>
        </nav>

        <div className="sidebar-footer">
          Panel administrativo
        </div>
      </aside>

      <main className="dashboard-main">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {activeSection === 'create' && (
          <section className="dashboard-section">
            <header className="section-header">
              <span className="section-eyebrow">
                Nueva invitación
              </span>

              <h1>Crea un nuevo evento</h1>

              <p>
                Completa la información principal. El evento se guardará
                en MongoDB y aparecerá automáticamente en Mis eventos.
              </p>
            </header>

            <div className="form-card">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="groomName">
                      Nombre del novio
                    </label>

                    <input
                      id="groomName"
                      type="text"
                      name="groomName"
                      value={formData.groomName}
                      onChange={handleChange}
                      placeholder="Ejemplo: Manuel"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="brideName">
                      Nombre de la novia
                    </label>

                    <input
                      id="brideName"
                      type="text"
                      name="brideName"
                      value={formData.brideName}
                      onChange={handleChange}
                      placeholder="Ejemplo: Luz"
                      required
                    />
                  </div>

                  <div className="form-field form-field-full">
                    <label htmlFor="eventDate">
                      Fecha del evento
                    </label>

                    <input
                      id="eventDate"
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field form-field-full">
                    <label htmlFor="welcomeMessage">
                      Mensaje de bienvenida
                    </label>

                    <textarea
                      id="welcomeMessage"
                      name="welcomeMessage"
                      rows="5"
                      value={formData.welcomeMessage}
                      onChange={handleChange}
                      placeholder="Escribe un mensaje para los invitados"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? 'Guardando evento...'
                      : 'Crear invitación'}
                  </button>
                </div>
              </form>
            </div>

            {generatedWedding && (
              <div className="created-card">
                <div>
                  <span className="created-label">
                    Evento creado correctamente
                  </span>

                  <h2>
                    {generatedWedding.groomName} y{' '}
                    {generatedWedding.brideName}
                  </h2>

                  <p>
                    La información ya fue guardada en la base de datos.
                  </p>
                </div>

                <div className="generated-url">
                  <span>{generatedUrl}</span>

                  <button
                    type="button"
                    onClick={copyGeneratedUrl}
                  >
                    Copiar
                  </button>
                </div>

                <Link
                  className="secondary-button"
                  to={`/boda/${generatedWedding.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir invitación
                </Link>
              </div>
            )}
          </section>
        )}

        {activeSection === 'events' && (
          <section className="dashboard-section">
            <header className="section-header section-header-row">
              <div>
                <span className="section-eyebrow">
                  Administración
                </span>

                <h1>Mis eventos</h1>

                <p>
                  Consulta y administra las invitaciones guardadas.
                </p>
              </div>

              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => changeSection('create')}
              >
                Nuevo evento
              </button>
            </header>

            {loadingEvents ? (
              <div className="empty-state">
                Cargando eventos...
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <h2>Todavía no hay eventos</h2>
                <p>
                  Crea una invitación para verla en esta sección.
                </p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((wedding) => (
                  <article
                    className="event-card"
                    key={wedding._id}
                  >
                    <div className="event-card-header">
                      <span className="event-status">
                        Publicado
                      </span>

                      <span className="event-date">
                        {formatDate(wedding.eventDate)}
                      </span>
                    </div>

                    <h2>
                      {wedding.groomName} y {wedding.brideName}
                    </h2>

                    <p>{wedding.welcomeMessage}</p>

                    <div className="event-slug">
                      /boda/{wedding.slug}
                    </div>

                    <div className="event-actions">
                      <Link
                        to={`/boda/${wedding.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                      >
                        Abrir
                      </Link>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDelete(wedding._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === 'settings' && (
          <section className="dashboard-section">
            <header className="section-header">
              <span className="section-eyebrow">
                Configuración
              </span>

              <h1>Ajustes</h1>

              <p>
                Personaliza el nombre del panel y el mensaje
                predeterminado.
              </p>
            </header>

            <div className="form-card settings-card">
              <form onSubmit={handleSaveSettings}>
                <div className="form-field">
                  <label htmlFor="businessName">
                    Nombre del panel
                  </label>

                  <input
                    id="businessName"
                    type="text"
                    value={settings.businessName}
                    onChange={(event) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        businessName: event.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="defaultMessage">
                    Mensaje predeterminado
                  </label>

                  <textarea
                    id="defaultMessage"
                    rows="5"
                    value={settings.defaultMessage}
                    onChange={(event) =>
                      setSettings((currentSettings) => ({
                        ...currentSettings,
                        defaultMessage: event.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                  >
                    Guardar ajustes
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}