import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones basadas en la estructura de carpetas que configuramos
import LandingPage from './pages/LandingPage';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta dinámica para la invitación pública: 
            Ejemplo: /boda/manuel-y-luz-2026 */}
        <Route path="/boda/:slug" element={<LandingPage />} />

        {/* Ruta para el Panel de Administración */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Ruta por defecto: Redirige a /admin para que empieces a gestionar */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;