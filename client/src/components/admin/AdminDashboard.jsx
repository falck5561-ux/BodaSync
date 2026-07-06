import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    fecha: '',
    mensaje: ''
  });

  // Estado para mostrar la URL generada al terminar
  const [generatedSlug, setGeneratedSlug] = useState(null);

  // Función que detecta cuando escribes en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Función que se ejecuta al darle al botón "Crear Boda"
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que la página recargue
    
    // Convertimos "Carlos y Ana" en "carlos-y-ana"
    const slug = formData.nombres
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Reemplaza espacios y símbolos con guiones
      .replace(/(^-|-$)+/g, '');   // Limpia guiones al inicio o final

    // Generamos el identificador final agregando el año
    const anio = formData.fecha.split('-')[0]; // Saca el año de la fecha
    const finalSlug = `${slug}-${anio}`;

    setGeneratedSlug(finalSlug);
  };

  return (
    <div className="dashboard-container">
      
      {/* Barra lateral */}
      <aside className="sidebar">
        <h2>BodaSync</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '15px', color: '#38bdf8', fontWeight: 'bold' }}>✨ Crear Invitación</li>
            <li style={{ padding: '15px', opacity: 0.6 }}>📂 Mis Eventos</li>
            <li style={{ padding: '15px', opacity: 0.6 }}>⚙️ Ajustes</li>
          </ul>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="main-content">
        <header className="fade-in">
          <h1>Creador de Bodas</h1>
          <p>Configura los detalles del evento para generar una invitación única.</p>
        </header>

        {/* Tarjeta del Formulario */}
        <section className="creation-card slide-up">
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Nombres de los Novios</label>
              <input 
                type="text" 
                name="nombres"
                placeholder="Ej. Manuel y Luz"
                value={formData.nombres}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Fecha del Evento</label>
              <input 
                type="date" 
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Mensaje de Bienvenida</label>
              <textarea 
                name="mensaje"
                rows="4"
                placeholder="¡Nos casamos y queremos que seas parte de este día especial!"
                value={formData.mensaje}
                onChange={handleChange}
                required 
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Generar Invitación Dinámica ✨
            </button>
          </form>
        </section>

        {/* Mensaje de Éxito y URL (Solo aparece después de crear la boda) */}
        {generatedSlug && (
          <div className="success-card slide-up" style={{ animationDelay: '0.2s' }}>
            <h3>¡Evento Creado con Éxito! 🎉</h3>
            <p>Comparte este enlace con tus invitados:</p>
            {/* Este Link usa la ruta dinámica que configuraste en App.jsx */}
            <Link to={`/boda/${generatedSlug}`} target="_blank" className="generated-link">
              localhost:5173/boda/{generatedSlug}
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}