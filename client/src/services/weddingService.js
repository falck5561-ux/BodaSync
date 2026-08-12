const DEFAULT_SERVER_URL = 'http://localhost:5000';

const ADMIN_TOKEN_STORAGE_KEY =
  'bodasync:admin-google-id-token:v1';

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_FILE_SIZE = 12 * 1024 * 1024;
const MAX_GALLERY_FILES = 8;

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
  const normalizedToken = cleanText(token);

  adminAuthToken = normalizedToken;

  const storage = getSessionStorage();

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
    /*
     * Si sessionStorage no está disponible,
     * conservamos el token únicamente en memoria.
     */
  }

  return normalizedToken;
}

export function getAdminAuthToken() {
  if (adminAuthToken) {
    return adminAuthToken;
  }

  const storage = getSessionStorage();

  if (!storage) {
    return '';
  }

  try {
    const storedToken = cleanText(
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

  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(
      ADMIN_TOKEN_STORAGE_KEY
    );
  } catch {
    /*
     * No necesitamos realizar ninguna
     * acción adicional.
     */
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
    this.status = options.status || 0;
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
    typeof data?.message === 'string' &&
    data.message.trim()
  ) {
    return data.message.trim();
  }

  if (
    typeof data?.error === 'string' &&
    data.error.trim()
  ) {
    return data.error.trim();
  }

  if (
    typeof data?.error?.message ===
      'string' &&
    data.error.message.trim()
  ) {
    return data.error.message.trim();
  }

  return fallbackMessage;
}

/*
 * =========================================================
 * REQUEST BODASYNC API
 * =========================================================
 *
 * Todas las peticiones administrativas pasan por aquí.
 *
 * Si existe una sesión administrativa activa,
 * se añade automáticamente:
 *
 * Authorization: Bearer <google-token>
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
   * Con FormData no establecemos Content-Type.
   * El navegador genera automáticamente el boundary.
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
    if (error?.name === 'AbortError') {
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

function getFileDisplayName(file) {
  return cleanText(
    file?.name ||
      file?.originalname ||
      'archivo'
  );
}

/*
 * =========================================================
 * VALIDAR ARCHIVOS ANTES DE CLOUDINARY
 * =========================================================
 *
 * Conservamos los límites que ya manejaba
 * BodaSync en el servidor:
 *
 * imágenes: 5 MB
 * audio: 12 MB
 */

function validateDirectUploadFile(
  file,
  resourceType
) {
  if (!file) {
    throw new WeddingServiceError(
      'No se proporcionó un archivo para subir.',
      {
        code:
          'INVALID_UPLOAD_FILE'
      }
    );
  }

  const fileSize =
    Number(file.size) || 0;

  const fileName =
    getFileDisplayName(file);

  if (
    resourceType === 'image' &&
    fileSize >
      MAX_IMAGE_FILE_SIZE
  ) {
    throw new WeddingServiceError(
      `${fileName} supera el límite de 5 MB para imágenes.`,
      {
        code:
          'IMAGE_TOO_LARGE'
      }
    );
  }

  if (
    resourceType === 'video' &&
    fileSize >
      MAX_AUDIO_FILE_SIZE
  ) {
    throw new WeddingServiceError(
      `${fileName} supera el límite de 12 MB para audio.`,
      {
        code:
          'AUDIO_TOO_LARGE'
      }
    );
  }

  return true;
}

/*
 * =========================================================
 * MEDIA YA EXISTENTE
 * =========================================================
 *
 * Cuando editamos una invitación podemos tener URLs
 * de Cloudinary mezcladas con File nuevos.
 *
 * Las URLs existentes deben conservarse.
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
          .slice(
            0,
            MAX_GALLERY_FILES
          )
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
 *
 * Conservamos el mismo comportamiento que ya tenía
 * BodaSync.
 *
 * La media recién subida tiene prioridad.
 * Si un archivo no fue reemplazado se conserva su URL.
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
 * PEDIR FIRMA DE CLOUDINARY
 * =========================================================
 *
 * Esta petición es pequeña.
 *
 * NO contiene el archivo.
 *
 * POST /api/uploads/signature
 */

async function getCloudinaryUploadSignature(
  resourceType,
  options = {}
) {
  const response =
    await request(
      '/uploads/signature',
      {
        method: 'POST',

        body: {
          resourceType
        },

        signal:
          options.signal
      }
    );

  const cloudName =
    cleanText(
      response?.cloudName
    );

  const apiKey =
    cleanText(
      response?.apiKey
    );

  const signature =
    cleanText(
      response?.signature
    );

  const assetFolder =
    cleanText(
      response?.assetFolder
    );

  const uploadUrl =
    cleanText(
      response?.uploadUrl
    );

  const normalizedResourceType =
    cleanText(
      response?.resourceType
    );

  const timestamp =
    Number(
      response?.timestamp
    );

  if (
    !cloudName ||
    !apiKey ||
    !signature ||
    !assetFolder ||
    !uploadUrl ||
    !normalizedResourceType ||
    !Number.isFinite(timestamp)
  ) {
    throw new WeddingServiceError(
      'Cloudinary no devolvió una firma de subida válida.',
      {
        code:
          'INVALID_CLOUDINARY_SIGNATURE',
        details: response
      }
    );
  }

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    assetFolder,
    resourceType:
      normalizedResourceType,
    uploadUrl
  };
}

/*
 * =========================================================
 * SUBIDA DIRECTA A CLOUDINARY
 * =========================================================
 *
 * IMPORTANTE:
 *
 * Esta petición NO pasa por Vercel.
 *
 * Navegador
 *    ↓
 * Cloudinary
 *
 * Esto evita el error 413 causado por enviar todas las
 * imágenes y música juntas a una Vercel Function.
 */

async function uploadFileDirectlyToCloudinary(
  file,
  signatureData,
  options = {}
) {
  const resourceType =
    cleanText(
      signatureData?.resourceType
    );

  validateDirectUploadFile(
    file,
    resourceType
  );

  const formData =
    new FormData();

  /*
   * file no forma parte de la firma.
   */

  formData.append(
    'file',
    file
  );

  /*
   * api_key tampoco forma parte de la firma,
   * pero Cloudinary lo requiere en el request.
   */

  formData.append(
    'api_key',
    signatureData.apiKey
  );

  /*
   * Estos valores deben coincidir exactamente
   * con los valores utilizados por el backend
   * para generar la firma.
   */

  formData.append(
    'timestamp',
    String(
      signatureData.timestamp
    )
  );

  formData.append(
    'signature',
    signatureData.signature
  );

  formData.append(
    'asset_folder',
    signatureData.assetFolder
  );

  let response;

  try {
    response = await fetch(
      signatureData.uploadUrl,
      {
        method: 'POST',
        body: formData,
        signal: options.signal
      }
    );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error;
    }

    throw new WeddingServiceError(
      `No fue posible subir ${getFileDisplayName(
        file
      )} a Cloudinary.`,
      {
        code:
          'CLOUDINARY_NETWORK_ERROR',
        details: error
      }
    );
  }

  const data =
    await parseResponse(response);

  if (!response.ok) {
    throw new WeddingServiceError(
      getErrorMessage(
        data,
        `Cloudinary rechazó ${getFileDisplayName(
          file
        )}.`
      ),
      {
        status:
          response.status,

        code:
          'CLOUDINARY_UPLOAD_FAILED',

        details:
          data
      }
    );
  }

  const secureUrl =
    cleanText(
      data?.secure_url ||
        data?.url
    );

  if (!secureUrl) {
    throw new WeddingServiceError(
      'Cloudinary terminó la subida pero no devolvió una URL válida.',
      {
        code:
          'CLOUDINARY_INVALID_RESPONSE',

        details:
          data
      }
    );
  }

  return secureUrl;
}

/*
 * =========================================================
 * SUBIR FOTOGRAFÍAS Y MÚSICA
 * =========================================================
 *
 * NUEVO FLUJO:
 *
 * 1. BodaSync pide una firma pequeña a Vercel.
 * 2. El navegador sube los archivos directamente
 *    a Cloudinary.
 * 3. Cloudinary devuelve las URLs.
 * 4. useWeddingBuilder recibe exactamente:
 *
 * {
 *   media: {
 *     coverImage,
 *     coupleImage,
 *     backgroundMusic,
 *     musicUrl,
 *     gallery
 *   }
 * }
 *
 * Por eso no necesitamos modificar useWeddingBuilder.
 */

export async function uploadWeddingMedia(
  media = {},
  options = {}
) {
  const existingMedia =
    getExistingMediaUrls(media);

  const coverImageFile =
    getFileFromMediaItem(
      media.coverImage
    );

  const coupleImageFile =
    getFileFromMediaItem(
      media.coupleImage
    );

  const backgroundMusicFile =
    getFileFromMediaItem(
      media.backgroundMusic ||
        media.musicUrl ||
        media.music
    );

  const gallery =
    Array.isArray(media.gallery)
      ? media.gallery
      : [];

  const galleryFiles =
    gallery
      .slice(
        0,
        MAX_GALLERY_FILES
      )
      .map((item) =>
        getFileFromMediaItem(item)
      )
      .filter(Boolean);

  const hasNewImages =
    Boolean(
      coverImageFile ||
        coupleImageFile ||
        galleryFiles.length
    );

  const hasNewAudio =
    Boolean(
      backgroundMusicFile
    );

  /*
   * Si no existen nuevos archivos,
   * devolvemos directamente las URLs existentes.
   */

  if (
    !hasNewImages &&
    !hasNewAudio
  ) {
    return {
      media:
        existingMedia
    };
  }

  /*
   * =======================================================
   * PEDIR FIRMAS
   * =======================================================
   *
   * Una firma para imágenes.
   * Una firma para audio.
   *
   * Podemos reutilizar la misma firma para todos los
   * archivos que compartan exactamente sus parámetros.
   */

  const [
    imageSignature,
    audioSignature
  ] = await Promise.all([
    hasNewImages
      ? getCloudinaryUploadSignature(
          'image',
          {
            signal:
              options.signal
          }
        )
      : Promise.resolve(null),

    hasNewAudio
      ? getCloudinaryUploadSignature(
          'video',
          {
            signal:
              options.signal
          }
        )
      : Promise.resolve(null)
  ]);

  /*
   * =======================================================
   * SUBIR PORTADA
   * =======================================================
   */

  const coverUploadPromise =
    coverImageFile
      ? uploadFileDirectlyToCloudinary(
          coverImageFile,
          imageSignature,
          {
            signal:
              options.signal
          }
        )
      : Promise.resolve('');

  /*
   * =======================================================
   * SUBIR FOTO DE PAREJA
   * =======================================================
   */

  const coupleUploadPromise =
    coupleImageFile
      ? uploadFileDirectlyToCloudinary(
          coupleImageFile,
          imageSignature,
          {
            signal:
              options.signal
          }
        )
      : Promise.resolve('');

  /*
   * =======================================================
   * SUBIR MÚSICA
   * =======================================================
   */

  const musicUploadPromise =
    backgroundMusicFile
      ? uploadFileDirectlyToCloudinary(
          backgroundMusicFile,
          audioSignature,
          {
            signal:
              options.signal
          }
        )
      : Promise.resolve('');

  /*
   * =======================================================
   * SUBIR GALERÍA
   * =======================================================
   *
   * Promise.all conserva el orden del arreglo original.
   */

  const galleryUploadPromise =
    Promise.all(
      galleryFiles.map((file) =>
        uploadFileDirectlyToCloudinary(
          file,
          imageSignature,
          {
            signal:
              options.signal
          }
        )
      )
    );

  const [
    uploadedCoverImage,
    uploadedCoupleImage,
    uploadedBackgroundMusic,
    uploadedGallery
  ] = await Promise.all([
    coverUploadPromise,
    coupleUploadPromise,
    musicUploadPromise,
    galleryUploadPromise
  ]);

  /*
   * =======================================================
   * MEDIA RECIÉN SUBIDA
   * =======================================================
   */

  const uploadedMedia = {
    coverImage:
      uploadedCoverImage,

    coupleImage:
      uploadedCoupleImage,

    backgroundMusic:
      uploadedBackgroundMusic,

    musicUrl:
      uploadedBackgroundMusic,

    gallery:
      uploadedGallery
  };

  /*
   * =======================================================
   * CONSERVAR MEDIA EXISTENTE
   * =======================================================
   */

  const finalMedia =
    mergeMedia(
      existingMedia,
      uploadedMedia
    );

  return {
    media:
      finalMedia
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
    typeof weddingData !==
      'object'
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
      String(
        weddingId || ''
      )
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
    typeof weddingData !==
      'object' ||
    Array.isArray(
      weddingData
    )
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
 */

export async function getWeddings(
  options = {}
) {
  return request(
    '/weddings',
    {
      signal:
        options.signal
    }
  );
}

/*
 * =========================================================
 * OBTENER INVITACIÓN PÚBLICA POR SLUG
 * =========================================================
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
      signal:
        options.signal
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
      String(
        weddingId || ''
      )
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
      method:
        'DELETE',

      signal:
        options.signal
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