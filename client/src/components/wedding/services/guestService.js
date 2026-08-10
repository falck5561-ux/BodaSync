import { PUBLIC_API_URL } from './weddingPublicService';

export class GuestServiceError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'GuestServiceError';
    this.status = options.status || 0;
    this.code = options.code || 'GUEST_REQUEST_ERROR';
    this.details = options.details || null;
  }
}

function cleanString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim();

  return normalizedValue || fallback;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    return text || null;
  } catch {
    return null;
  }
}

function getResponseMessage(data, fallbackMessage) {
  if (typeof data === 'string' && data.trim()) {
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

  return fallbackMessage;
}

async function request(endpoint, options = {}) {
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
          Accept: 'application/json',
          ...(body
            ? {
                'Content-Type': 'application/json'
              }
            : {}),
          ...headers
        },
        ...(body
          ? {
              body: JSON.stringify(body)
            }
          : {})
      }
    );
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }

    throw new GuestServiceError(
      'No fue posible conectarse con el servidor.',
      {
        code: 'NETWORK_ERROR',
        details: error
      }
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    let fallbackMessage =
      'No fue posible completar la solicitud.';

    if (response.status === 404) {
      fallbackMessage =
        'La invitación no existe.';
    }

    if (response.status === 403) {
      fallbackMessage =
        'El libro de firmas no está disponible.';
    }

    throw new GuestServiceError(
      getResponseMessage(
        data,
        fallbackMessage
      ),
      {
        status: response.status,
        code: 'GUEST_REQUEST_FAILED',
        details: data
      }
    );
  }

  return data;
}

function normalizeMessagesResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.messages)) {
    return response.messages;
  }

  if (Array.isArray(response?.data?.messages)) {
    return response.data.messages;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function normalizeGuestMessage(message, index = 0) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const content = cleanString(
    message.message ||
      message.mensaje ||
      message.content ||
      message.text
  );

  if (!content) {
    return null;
  }

  return {
    id:
      message.id ||
      message._id ||
      `guest-message-${index + 1}`,

    message: content,

    author: cleanString(
      message.author ||
        message.nombre ||
        message.name,
      'Invitado'
    ),

    createdAt:
      message.createdAt ||
      message.created_at ||
      message.date ||
      new Date().toISOString()
  };
}

export async function getGuestMessages(
  slug,
  options = {}
) {
  const normalizedSlug = cleanString(slug);

  if (!normalizedSlug) {
    return [];
  }

  const response = await request(
    `/weddings/${encodeURIComponent(
      normalizedSlug
    )}/messages`,
    {
      signal: options.signal
    }
  );

  return normalizeMessagesResponse(response)
    .map((message, index) =>
      normalizeGuestMessage(
        message,
        index
      )
    )
    .filter(Boolean);
}

export async function submitGuestBookMessage({
  slug,
  message,
  author,
  signal
}) {
  const normalizedSlug = cleanString(slug);
  const normalizedMessage = cleanString(message);
  const normalizedAuthor = cleanString(author);

  if (!normalizedSlug) {
    throw new GuestServiceError(
      'No se proporcionó la invitación.',
      {
        code: 'INVALID_WEDDING_SLUG'
      }
    );
  }

  if (!normalizedMessage) {
    throw new GuestServiceError(
      'Escribe un mensaje para los novios.',
      {
        code: 'EMPTY_GUEST_MESSAGE'
      }
    );
  }

  if (!normalizedAuthor) {
    throw new GuestServiceError(
      'Escribe tu nombre o el nombre de tu familia.',
      {
        code: 'EMPTY_GUEST_AUTHOR'
      }
    );
  }

  if (normalizedMessage.length > 1200) {
    throw new GuestServiceError(
      'El mensaje no puede superar los 1200 caracteres.',
      {
        code: 'MESSAGE_TOO_LONG'
      }
    );
  }

  if (normalizedAuthor.length > 120) {
    throw new GuestServiceError(
      'El nombre no puede superar los 120 caracteres.',
      {
        code: 'AUTHOR_TOO_LONG'
      }
    );
  }

  return request(
    `/weddings/${encodeURIComponent(
      normalizedSlug
    )}/messages`,
    {
      method: 'POST',
      signal,
      body: {
        message: normalizedMessage,
        author: normalizedAuthor
      }
    }
  );
}

export function getGuestServiceErrorMessage(
  error
) {
  if (error?.name === 'AbortError') {
    return '';
  }

  if (
    typeof error?.message === 'string' &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return 'Ocurrió un problema al enviar el mensaje.';
}

const guestService = {
  getGuestMessages,
  submitGuestBookMessage,
  getGuestServiceErrorMessage
};

export default guestService;