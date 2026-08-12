const DEFAULT_SERVER_URL = 'http://localhost:5000';

const ADMIN_TOKEN_STORAGE_KEY =
  'bodasync:admin-google-id-token:v1';

let adminAuthToken = '';

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
    DEFAULT_SERVER_URL;

  const normalizedUrl =
    removeTrailingSlashes(configuredUrl);

  if (normalizedUrl.endsWith('/api')) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api`;
}

export const API_BASE_URL = getApiBaseUrl();

/*
 * =========================================================
 * AUTENTICACIÓN ADMINISTRATIVA
 * =========================================================
 *
 * El token de Google se conserva únicamente durante
 * la sesión actual del navegador.
 *
 * El componente de login llamará:
 *
 * setAdminAuthToken(response.credential)
 *
 * y todas las peticiones administrativas comenzarán
 * automáticamente a enviar:
 *
 * Authorization: Bearer <google-id-token>
 */

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function setAdminAuthToken(token) {
  const normalizedToken =
    cleanText(token);

  adminAuthToken = normalizedToken;

  const storage =
    getSessionStorage();

  if (!storage) {
    return normalizedToken;
  }

  try {
    if (normalizedToken) {
      storage.setItem(
        ADMIN_TOKEN_STORAGE_KEY,
        normalizedToken
      );
    } else {
      storage.removeItem(
        ADMIN_TOKEN_STORAGE_KEY
      );
    }
  } catch {
    // Si sessionStorage no está disponible,
    // conservamos el token solamente en memoria.
  }

  return normalizedToken;
}

export function getAdminAuthToken() {
  if (adminAuthToken) {
    return adminAuthToken;
  }

  const storage =
    getSessionStorage();

  if (!storage) {
    return '';
  }

  try {
    const storedToken =
      cleanText(
        storage.getItem(
          ADMIN_TOKEN_STORAGE_KEY
        )
      );

    if (storedToken) {
      adminAuthToken = storedToken;
    }

    return storedToken;
  } catch {
    return '';
  }
}

export function clearAdminAuthToken() {
  adminAuthToken = '';

  const storage =
    getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(
      ADMIN_TOKEN_STORAGE_KEY
    );
  } catch {
    // No necesitamos hacer nada más.
  }
}

export function hasAdminAuthToken() {
  return Boolean(
    getAdminAuthToken()
  );
}

/*
 * =========================================================
 * ERRORES
 * =========================================================
 */

export class WeddingServiceError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'WeddingServiceError';

    this.status =
      options.status || 0;

    this.code =
      options.code ||
      'WEDDING_SERVICE_ERROR';

    this.details =
      options.details || null;
  }
}

/*
 * =========================================================
 * RESPUESTAS HTTP
 * =========================================================
 */

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

function getErrorMessage(
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

/*
 * =========================================================
 * REQUEST
 * =========================================================
 *
 * Todas las peticiones pasan por aquí.
 *
 * Si existe una sesión administrativa activa,
 * enviamos automáticamente el token de Google.
 *
 * Las rutas públicas funcionan normalmente incluso
 * si no existe token.
 */

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

  const isFormData =
    typeof FormData !== 'undefined' &&
    body instanceof FormData;

  const requestHeaders = {
    Accept: 'application/json',
    ...headers
  };

  const authToken =
    getAdminAuthToken();

  const hasAuthorizationHeader =
    Boolean(
      requestHeaders.Authorization ||
      requestHeaders.authorization
    );

  if (
    authToken &&
    !hasAuthorizationHeader
  ) {
    requestHeaders.Authorization =
      `Bearer ${authToken}`;
  }

  /*
   * Cuando mandamos FormData NO debemos
   * establecer Content-Type manualmente.
   *
   * El navegador genera automáticamente:
   *
   * multipart/form-data; boundary=...
   */

  if (
    body !== undefined &&
    body !== null &&
    !isFormData
  ) {
    requestHeaders['Content-Type'] =
      'application/json';
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        signal,
        headers: requestHeaders,

        ...(body !== undefined &&
        body !== null
          ? {
              body: isFormData
                ? body
                : JSON.stringify(body)
            }
          : {})
      }
    );
  } catch (error) {
    if (
      error?.name === 'AbortError'
    ) {
      throw error;
    }

    throw new WeddingServiceError(
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

    if (response.status === 400) {
      fallbackMessage =
        'La información enviada no es válida.';
    }

    if (response.status === 401) {
      /*
       * Un 401 significa normalmente que el token
       * expiró o dejó de ser válido.
       *
       * Lo eliminamos para obligar a iniciar
       * sesión nuevamente.
       */
      clearAdminAuthToken();

      fallbackMessage =
        'Tu sesión de administrador expiró. Inicia sesión nuevamente.';
    }

    if (response.status === 403) {
      fallbackMessage =
        'Esta cuenta no tiene permisos de administrador.';
    }

    if (response.status === 404) {
      fallbackMessage =
        'No se encontró la información solicitada.';
    }

    if (response.status === 409) {
      fallbackMessage =
        'Existe un conflicto con la información enviada.';
    }

    if (response.status === 413) {
      fallbackMessage =
        'Uno de los archivos es demasiado grande.';
    }

    if (response.status === 415) {
      fallbackMessage =
        'El tipo de archivo seleccionado no es compatible.';
    }

    if (response.status >= 500) {
      fallbackMessage =
        'El servidor presentó un problema.';
    }

    throw new WeddingServiceError(
      getErrorMessage(
        data,
        fallbackMessage
      ),
      {
        status: response.status,
        code:
          response.status === 401
            ? 'AUTH_REQUIRED'
            : response.status === 403
              ? 'AUTH_FORBIDDEN'
              : 'REQUEST_FAILED',
        details: data
      }
    );
  }

  return data;
}

/*
 * =========================================================
 * HELPERS DE MULTIMEDIA
 * =========================================================
 */

function getFileFromMediaItem(
  mediaItem
) {
  if (!mediaItem) {
    return null;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem instanceof File
  ) {
    return mediaItem;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem instanceof Blob
  ) {
    return mediaItem;
  }

  if (
    typeof File !== 'undefined' &&
    mediaItem.file instanceof File
  ) {
    return mediaItem.file;
  }

  if (
    typeof Blob !== 'undefined' &&
    mediaItem.file instanceof Blob
  ) {
    return mediaItem.file;
  }

  return null;
}

function getUrlFromMediaItem(
  mediaItem
) {
  if (!mediaItem) {
    return '';
  }

  if (
    typeof mediaItem === 'string'
  ) {
    return cleanText(mediaItem);
  }

  if (
    typeof mediaItem === 'object'
  ) {
    return cleanText(
      mediaItem.url ||
        mediaItem.secureUrl ||
        mediaItem.secure_url ||
        mediaItem.fileUrl ||
        mediaItem.path ||
        ''
    );
  }

  return '';
}

function hasFilesInFormData(
  formData
) {
  for (
    const [, value]
    of formData.entries()
  ) {
    if (
      typeof File !== 'undefined' &&
      value instanceof File
    ) {
      return true;
    }

    if (
      typeof Blob !== 'undefined' &&
      value instanceof Blob
    ) {
      return true;
    }
  }

  return false;
}

/*
 * =========================================================
 * NORMALIZAR MEDIA DEL SERVIDOR
 * =========================================================
 */

function normalizeUploadedMedia(
  response
) {
  const source =
    response?.media ||
    response?.data?.media ||
    response?.data ||
    response ||
    {};

  if (
    !source ||
    typeof source !== 'object' ||
    Array.isArray(source)
  ) {
    return {
      coverImage: '',
      coupleImage: '',
      backgroundMusic: '',
      musicUrl: '',
      gallery: []
    };
  }

  const coverImage =
    cleanText(
      source.coverImage ||
        source.heroImage ||
        source.cover ||
        ''
    );

  const coupleImage =
    cleanText(
      source.coupleImage ||
        source.storyImage ||
        source.couple ||
        ''
    );

  const backgroundMusic =
    cleanText(
      source.backgroundMusic ||
        source.musicUrl ||
        source.music ||
        ''
    );

  const gallerySource =
    Array.isArray(source.gallery)
      ? source.gallery
      : Array.isArray(source.photos)
        ? source.photos
        : [];

  const gallery =
    gallerySource
      .map((item) => {
        if (
          typeof item === 'string'
        ) {
          return cleanText(item);
        }

        if (
          item &&
          typeof item === 'object'
        ) {
          return cleanText(
            item.url ||
              item.path ||
              item.secureUrl ||
              item.secure_url ||
              item.fileUrl ||
              ''
          );
        }

        return '';
      })
      .filter(Boolean);

  return {
    coverImage,
    coupleImage,
    backgroundMusic,
    musicUrl: backgroundMusic,
    gallery
  };
}

/*
 * =========================================================
 * MEDIA YA EXISTENTE
 * =========================================================
 */

function getExistingMediaUrls(
  media = {}
) {
  const gallery =
    Array.isArray(media.gallery)
      ? media.gallery
          .map((item) =>
            getUrlFromMediaItem(item)
          )
          .filter(Boolean)
          .slice(0, 8)
      : [];

  const backgroundMusic =
    getUrlFromMediaItem(
      media.backgroundMusic ||
        media.musicUrl ||
        media.music
    );

  return {
    coverImage:
      getUrlFromMediaItem(
        media.coverImage
      ),

    coupleImage:
      getUrlFromMediaItem(
        media.coupleImage
      ),

    backgroundMusic,

    musicUrl:
      backgroundMusic,

    gallery
  };
}

/*
 * =========================================================
 * COMBINAR MEDIA
 * =========================================================
 */

function mergeMedia(
  existingMedia = {},
  uploadedMedia = {}
) {
  const uploadedGallery =
    Array.isArray(
      uploadedMedia.gallery
    )
      ? uploadedMedia.gallery.filter(
          Boolean
        )
      : [];

  const existingGallery =
    Array.isArray(
      existingMedia.gallery
    )
      ? existingMedia.gallery.filter(
          Boolean
        )
      : [];

  const backgroundMusic =
    cleanText(
      uploadedMedia.backgroundMusic ||
        uploadedMedia.musicUrl ||
        existingMedia.backgroundMusic ||
        existingMedia.musicUrl ||
        ''
    );

  return {
    coverImage:
      cleanText(
        uploadedMedia.coverImage
      ) ||
      cleanText(
        existingMedia.coverImage
      ),

    coupleImage:
      cleanText(
        uploadedMedia.coupleImage
      ) ||
      cleanText(
        existingMedia.coupleImage
      ),

    backgroundMusic,

    musicUrl:
      backgroundMusic,

    gallery:
      uploadedGallery.length > 0
        ? uploadedGallery
        : existingGallery
  };
}

/*
 * =========================================================
 * SUBIR FOTOGRAFÍAS Y MÚSICA
 * =========================================================
 */

export async function uploadWeddingMedia(
  media = {},
  options = {}
) {
  const formData =
    new FormData();

  const existingMedia =
    getExistingMediaUrls(media);

  const coverImage =
    getFileFromMediaItem(
      media.coverImage
    );

  const coupleImage =
    getFileFromMediaItem(
      media.coupleImage
    );

  const backgroundMusic =
    getFileFromMediaItem(
      media.backgroundMusic ||
        media.musicUrl ||
        media.music
    );

  if (coverImage) {
    formData.append(
      'coverImage',
      coverImage
    );
  }

  if (coupleImage) {
    formData.append(
      'coupleImage',
      coupleImage
    );
  }

  if (backgroundMusic) {
    formData.append(
      'backgroundMusic',
      backgroundMusic
    );
  }

  const gallery =
    Array.isArray(media.gallery)
      ? media.gallery
      : [];

  gallery
    .slice(0, 8)
    .forEach((galleryItem) => {
      const file =
        getFileFromMediaItem(
          galleryItem
        );

      if (file) {
        formData.append(
          'gallery',
          file
        );
      }
    });

  /*
   * Si no hay archivos nuevos,
   * devolvemos las URLs existentes.
   */

  if (
    !hasFilesInFormData(formData)
  ) {
    return {
      media: existingMedia
    };
  }

  const response =
    await request(
      '/uploads',
      {
        method: 'POST',
        body: formData,
        signal: options.signal
      }
    );

  const uploadedMedia =
    normalizeUploadedMedia(
      response
    );

  const finalMedia =
    mergeMedia(
      existingMedia,
      uploadedMedia
    );

  return {
    media: finalMedia
  };
}

/*
 * =========================================================
 * CREAR INVITACIÓN
 * =========================================================
 */

export async function createWedding(
  weddingData,
  options = {}
) {
  if (
    !weddingData ||
    typeof weddingData !== 'object'
  ) {
    throw new WeddingServiceError(
      'No se proporcionó la información de la invitación.',
      {
        code:
          'INVALID_WEDDING_DATA'
      }
    );
  }

  return request(
    '/weddings',
    {
      method: 'POST',
      body: weddingData,
      signal: options.signal
    }
  );
}

/*
 * =========================================================
 * ACTUALIZAR INVITACIÓN
 * =========================================================
 */

export async function updateWedding(
  weddingId,
  weddingData,
  options = {}
) {
  const normalizedId =
    cleanText(
      String(weddingId || '')
    );

  if (!normalizedId) {
    throw new WeddingServiceError(
      'No se proporcionó el identificador de la invitación.',
      {
        code:
          'INVALID_WEDDING_ID'
      }
    );
  }

  if (
    !weddingData ||
    typeof weddingData !== 'object' ||
    Array.isArray(weddingData)
  ) {
    throw new WeddingServiceError(
      'No se proporcionó la información que deseas actualizar.',
      {
        code:
          'INVALID_WEDDING_DATA'
      }
    );
  }

  return request(
    `/weddings/${encodeURIComponent(
      normalizedId
    )}`,
    {
      method: 'PUT',
      body: weddingData,
      signal: options.signal
    }
  );
}

/*
 * =========================================================
 * OBTENER TODAS LAS INVITACIONES
 * =========================================================
 *
 * Ruta administrativa.
 * El token se añade automáticamente por request().
 */

export async function getWeddings(
  options = {}
) {
  return request(
    '/weddings',
    {
      signal: options.signal
    }
  );
}

/*
 * =========================================================
 * OBTENER INVITACIÓN POR SLUG
 * =========================================================
 *
 * Esta ruta permanece pública en el backend.
 */

export async function getWeddingBySlug(
  slug,
  options = {}
) {
  const normalizedSlug =
    cleanText(slug);

  if (!normalizedSlug) {
    throw new WeddingServiceError(
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

/*
 * =========================================================
 * ELIMINAR INVITACIÓN
 * =========================================================
 */

export async function deleteWedding(
  weddingId,
  options = {}
) {
  const normalizedId =
    cleanText(
      String(weddingId || '')
    );

  if (!normalizedId) {
    throw new WeddingServiceError(
      'No se proporcionó el identificador de la invitación.',
      {
        code:
          'INVALID_WEDDING_ID'
      }
    );
  }

  return request(
    `/weddings/${encodeURIComponent(
      normalizedId
    )}`,
    {
      method: 'DELETE',
      signal: options.signal
    }
  );
}

/*
 * =========================================================
 * ALIASES DE COMPATIBILIDAD
 * =========================================================
 */

export const getAllWeddings =
  getWeddings;

export const removeWedding =
  deleteWedding;

/*
 * =========================================================
 * MENSAJE DE ERROR
 * =========================================================
 */

export function getWeddingServiceErrorMessage(
  error
) {
  if (
    error?.name === 'AbortError'
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

  return 'Ocurrió un problema al comunicarse con el servidor.';
}

/*
 * =========================================================
 * SERVICE
 * =========================================================
 */

const weddingService = {
  API_BASE_URL,

  setAdminAuthToken,
  getAdminAuthToken,
  clearAdminAuthToken,
  hasAdminAuthToken,

  uploadWeddingMedia,

  createWedding,
  updateWedding,

  getWeddings,
  getAllWeddings,

  getWeddingBySlug,

  deleteWedding,
  removeWedding,

  getWeddingServiceErrorMessage
};

export default weddingService;