require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const guestMessageRoutes = require('./routes/guestMessages');
const uploadRoutes = require('./routes/uploads');
const weddingRoutes = require('./routes/weddings');

const app = express();

const PORT = Number(process.env.PORT) || 5000;

function normalizeOrigin(value) {
  let normalized = String(value || '').trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.replace(/\/+$/, '');
}

const CLIENT_URL = normalizeOrigin(
  process.env.CLIENT_URL || 'http://localhost:5173'
);

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    CLIENT_URL
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

let mongoConnectionPromise = null;

/*
 * =========================================================
 * MONGODB
 * =========================================================
 */

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      'Falta MONGO_URI en las variables de entorno.'
    );
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(mongoUri)
      .then(() => {
        console.log('MongoDB conectado');

        return mongoose.connection;
      })
      .catch((error) => {
        mongoConnectionPromise = null;
        throw error;
      });
  }

  return mongoConnectionPromise;
}

/*
 * =========================================================
 * CORS
 * =========================================================
 */

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Peticiones sin Origin:
       * navegador directo, Postman, health checks, etc.
       */
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error(
        'Origen rechazado por CORS:',
        normalizedOrigin
      );

      console.error(
        'Orígenes permitidos:',
        Array.from(allowedOrigins)
      );

      const error = new Error(
        `Origen no permitido por CORS: ${normalizedOrigin}`
      );

      error.status = 403;

      return callback(error);
    },

    credentials: true
  })
);

/*
 * =========================================================
 * BODY PARSERS
 * =========================================================
 */

app.use(
  express.json({
    limit: '2mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '2mb'
  })
);

/*
 * =========================================================
 * ARCHIVOS LOCALES LEGACY
 * =========================================================
 *
 * Las nuevas subidas utilizan Cloudinary.
 */

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

/*
 * =========================================================
 * HEALTH CHECK
 * =========================================================
 */

app.get('/api/health', (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'BodaSync API funcionando.',
    environment: process.env.VERCEL
      ? 'vercel'
      : 'local'
  });
});

/*
 * =========================================================
 * UPLOADS
 * =========================================================
 */

app.use(
  '/api/uploads',
  uploadRoutes
);

/*
 * =========================================================
 * CONEXIÓN A MONGODB PARA BODAS
 * =========================================================
 */

app.use(
  '/api/weddings',
  async (_req, res, next) => {
    try {
      await connectDatabase();

      next();
    } catch (error) {
      console.error(
        'Error de conexión a MongoDB:',
        error
      );

      return res.status(503).json({
        message:
          'No fue posible conectar con la base de datos.'
      });
    }
  }
);

/*
 * =========================================================
 * LIBRO DE FIRMAS
 * =========================================================
 */

app.use(
  '/api/weddings',
  guestMessageRoutes
);

/*
 * =========================================================
 * BODAS
 * =========================================================
 */

app.use(
  '/api/weddings',
  weddingRoutes
);

/*
 * =========================================================
 * 404
 * =========================================================
 */

app.use((_req, res) => {
  return res.status(404).json({
    message: 'Ruta no encontrada.'
  });
});

/*
 * =========================================================
 * MANEJADOR DE ERRORES
 * =========================================================
 */

app.use((error, _req, res, next) => {
  console.error(
    'Error del servidor:',
    error
  );

  if (res.headersSent) {
    return next(error);
  }

  return res
    .status(error.status || 500)
    .json({
      message:
        error.message ||
        'Error interno del servidor.'
    });
});

/*
 * =========================================================
 * DESARROLLO LOCAL
 * =========================================================
 */

async function startLocalServer() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `Servidor funcionando en http://localhost:${PORT}`
      );

      console.log(
        `Health: http://localhost:${PORT}/api/health`
      );

      console.log(
        `API de bodas: http://localhost:${PORT}/api/weddings`
      );

      console.log(
        'Orígenes CORS permitidos:',
        Array.from(allowedOrigins)
      );
    });
  } catch (error) {
    console.error(
      'No fue posible iniciar el servidor:',
      error
    );

    process.exit(1);
  }
}

if (require.main === module) {
  void startLocalServer();
}

/*
 * =========================================================
 * VERCEL
 * =========================================================
 */

module.exports = app;