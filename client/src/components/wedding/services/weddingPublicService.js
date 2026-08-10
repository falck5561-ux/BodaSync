const DEFAULT_API_URL = 'http://localhost:5000';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function removeTrailingSlashes(value = '') {
  return String(value).replace(/\/+$/, '');
}

function getApiBaseUrl() {
  const configuredUrl =
    cleanText(import.meta.env.VITE_API_URL) ||
    DEFAULT_API_URL;

  const normalizedUrl =
    removeTrailingSlashes(configuredUrl);

  if (normalizedUrl.endsWith('/api')) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api`;
}

/*
 * IMPORTANTE:
 *
 * guestService.js necesita importar
 * PUBLIC_API_URL desde este archivo.
 */
export const PUBLIC_API_URL =
  getApiBaseUrl();

export class WeddingPublicServiceError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name =
      'WeddingPublicServiceError';

    this.status =
      options.status || 0;

    this.code =
      options.code ||
      'WEDDING_REQUEST_ERROR';

    this.details =
      options.details || null;
  }
}

async function parseResponse(response) {
  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  if (
    contentType.includes(
      'application/json'
    )
  ) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text =
      await response.text();

    return text || null;
  } catch {
    return null;
  }
}

function getResponseMessage(
  data,
  fallbackMessage
) {
  if (
    typeof data === 'string' &&
    data.trim()
  ) {
    return data.trim();
  }

  if (
    typeof data?.message ===
      'string' &&
    data.message.trim()
  ) {
    return data.message.trim();
  }

  if (
    typeof data?.error ===
      'string' &&
    data.error.trim()
  ) {
    return data.error.trim();
  }

  return fallbackMessage;
}

async function request(
  endpoint,
  options = {}
) {
  const {
    method = 'GET',
    body,
    headers = {},
    signal
  } = options;

  let response;

  try {
    response = await fetch(
      `${PUBLIC_API_URL}${endpoint}`,
      {
        method,
        signal,

        headers: {
          Accept:
            'application/json',

          ...(body
            ? {
                'Content-Type':
                  'application/json'
              }
            : {}),

          ...headers
        },

        ...(body
          ? {
              body:
                JSON.stringify(body)
            }
          : {})
      }
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error;
    }

    throw new WeddingPublicServiceError(
      'No fue posible conectarse con el servidor.',
      {
        code: 'NETWORK_ERROR',
        details: error
      }
    );
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    let fallbackMessage =
      'No fue posible completar la solicitud.';

    if (response.status === 404) {
      fallbackMessage =
        'No se encontró la invitación solicitada.';
    }

    if (response.status === 400) {
      fallbackMessage =
        'La solicitud contiene información inválida.';
    }

    if (response.status >= 500) {
      fallbackMessage =
        'El servidor presentó un problema.';
    }

    throw new WeddingPublicServiceError(
      getResponseMessage(
        data,
        fallbackMessage
      ),
      {
        status: response.status,

        code:
          response.status === 404
            ? 'WEDDING_NOT_FOUND'
            : 'WEDDING_REQUEST_FAILED',

        details: data
      }
    );
  }

  return data;
}

function normalizeSlug(slug) {
  return cleanText(slug);
}

export async function getWeddingBySlug(
  slug,
  options = {}
) {
  const normalizedSlug =
    normalizeSlug(slug);

  if (!normalizedSlug) {
    throw new WeddingPublicServiceError(
      'No se proporcionó el identificador de la invitación.',
      {
        code:
          'INVALID_WEDDING_SLUG'
      }
    );
  }

  return request(
    `/weddings/${encodeURIComponent(
      normalizedSlug
    )}`,
    {
      signal: options.signal
    }
  );
}

export async function getPublicWedding(
  slug,
  options = {}
) {
  return getWeddingBySlug(
    slug,
    options
  );
}

export async function checkWeddingExists(
  slug,
  options = {}
) {
  try {
    await getWeddingBySlug(
      slug,
      options
    );

    return true;
  } catch (error) {
    if (
      error?.code ===
      'WEDDING_NOT_FOUND'
    ) {
      return false;
    }

    throw error;
  }
}

export function createWeddingPublicPath(
  slug
) {
  const normalizedSlug =
    normalizeSlug(slug);

  if (!normalizedSlug) {
    return '';
  }

  return `/boda/${encodeURIComponent(
    normalizedSlug
  )}`;
}

export function createWeddingPublicUrl(
  slug
) {
  const publicPath =
    createWeddingPublicPath(slug);

  if (!publicPath) {
    return '';
  }

  if (
    typeof window ===
    'undefined'
  ) {
    return publicPath;
  }

  return `${window.location.origin}${publicPath}`;
}

export function isWeddingNotFoundError(
  error
) {
  return (
    error instanceof
      WeddingPublicServiceError &&
    error.code ===
      'WEDDING_NOT_FOUND'
  );
}

export function getWeddingServiceErrorMessage(
  error
) {
  if (
    error?.name ===
    'AbortError'
  ) {
    return '';
  }

  if (
    typeof error?.message ===
      'string' &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return 'Ocurrió un problema al cargar la invitación.';
}

const weddingPublicService = {
  PUBLIC_API_URL,

  getWeddingBySlug,
  getPublicWedding,
  checkWeddingExists,

  createWeddingPublicPath,
  createWeddingPublicUrl,

  isWeddingNotFoundError,
  getWeddingServiceErrorMessage
};

export default weddingPublicService;