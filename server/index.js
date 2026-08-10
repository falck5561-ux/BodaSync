require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const guestMessageRoutes = require('./routes/guestMessages');
const uploadRoutes = require('./routes/uploads');
const weddingRoutes = require('./routes/weddings');

const app = express();

const PORT =
  Number(process.env.PORT) || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  'http://localhost:5173';

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      /*
       * Permitir también herramientas como
       * Postman o peticiones sin Origin.
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`
        )
      );
    },

    credentials: true
  })
);

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
 * =====================================================
 * ARCHIVOS SUBIDOS
 * =====================================================
 */
app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads'
    )
  )
);

/*
 * =====================================================
 * HEALTH CHECK
 * =====================================================
 */
app.get(
  '/api/health',
  (req, res) => {
    return res.status(200).json({
      ok: true,
      message: 'BodaSync API funcionando.'
    });
  }
);

/*
 * =====================================================
 * UPLOADS
 * =====================================================
 */
app.use(
  '/api/uploads',
  uploadRoutes
);

/*
 * =====================================================
 * LIBRO DE FIRMAS
 * =====================================================
 *
 * Esto produce exactamente:
 *
 * GET
 * /api/weddings/:slug/messages
 *
 * POST
 * /api/weddings/:slug/messages
 */
app.use(
  '/api/weddings',
  guestMessageRoutes
);

/*
 * =====================================================
 * BODAS
 * =====================================================
 */
app.use(
  '/api/weddings',
  weddingRoutes
);

/*
 * =====================================================
 * 404
 * =====================================================
 *
 * IMPORTANTE:
 * esto siempre debe estar DESPUÉS
 * de todas las rutas anteriores.
 */
app.use(
  (req, res) => {
    return res.status(404).json({
      message: 'Ruta no encontrada.'
    });
  }
);

/*
 * =====================================================
 * MANEJADOR DE ERRORES
 * =====================================================
 */
app.use(
  (error, req, res, next) => {
    console.error(
      'Error del servidor:',
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(
      error.status || 500
    ).json({
      message:
        error.message ||
        'Error interno del servidor.'
    });
  }
);

/*
 * =====================================================
 * INICIAR SERVIDOR
 * =====================================================
 */
async function startServer() {
  const mongoUri =
    process.env.MONGO_URI;

  if (!mongoUri) {
    console.error(
      'Falta MONGO_URI en server/.env'
    );

    process.exit(1);
  }

  try {
    await mongoose.connect(
      mongoUri
    );

    console.log(
      'MongoDB conectado'
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Servidor funcionando en http://localhost:${PORT}`
        );

        console.log(
          `Libro de firmas: http://localhost:${PORT}/api/weddings/:slug/messages`
        );
      }
    );
  } catch (error) {
    console.error(
      'No fue posible iniciar el servidor:',
      error
    );

    process.exit(1);
  }
}

void startServer();