import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Esto toma tu componente App y lo inyecta en el index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);