const {
  OAuth2Client
} = require('google-auth-library');

const googleClient = new OAuth2Client();

function cleanText(value) {
  return String(value || '').trim();
}

function getBearerToken(req) {
  const authorization =
    cleanText(req.get('authorization'));

  if (!authorization) {
    return '';
  }

  const [scheme, token] =
    authorization.split(/\s+/);

  if (
    String(scheme || '').toLowerCase() !==
      'bearer' ||
    !token
  ) {
    return '';
  }

  return cleanText(token);
}

async function requireAdmin(
  req,
  res,
  next
) {
  const googleClientId =
    cleanText(
      process.env.GOOGLE_CLIENT_ID
    );

  const adminEmail =
    cleanText(
      process.env.ADMIN_EMAIL
    ).toLowerCase();

  if (
    !googleClientId ||
    !adminEmail
  ) {
    console.error(
      'Configuración de administrador incompleta.'
    );

    return res.status(500).json({
      message:
        'La autenticación del administrador no está configurada correctamente.'
    });
  }

  const idToken =
    getBearerToken(req);

  if (!idToken) {
    return res.status(401).json({
      message:
        'Debes iniciar sesión para realizar esta acción.'
    });
  }

  try {
    const ticket =
      await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message:
          'La sesión de Google no es válida.'
      });
    }

    const email =
      cleanText(
        payload.email
      ).toLowerCase();

    const emailVerified =
      payload.email_verified === true;

    if (
      !email ||
      !emailVerified
    ) {
      return res.status(403).json({
        message:
          'La cuenta de Google no está verificada.'
      });
    }

    if (email !== adminEmail) {
      console.warn(
        `Acceso administrativo rechazado para: ${email}`
      );

      return res.status(403).json({
        message:
          'Esta cuenta no tiene permisos de administrador.'
      });
    }

    req.admin = {
      id: cleanText(
        payload.sub
      ),

      email,

      name: cleanText(
        payload.name
      ),

      picture: cleanText(
        payload.picture
      )
    };

    return next();
  } catch (error) {
    console.error(
      'Error verificando token de Google:',
      error.message
    );

    return res.status(401).json({
      message:
        'La sesión expiró o no es válida. Inicia sesión nuevamente.'
    });
  }
}

module.exports = {
  requireAdmin
};