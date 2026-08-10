import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  createWedding,
  deleteWedding,
  getWeddings
} from '../../../services/weddingService';

import { formatWeddingDate } from '../utils/dateUtils';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function getWeddingId(wedding) {
  if (!wedding || typeof wedding !== 'object') {
    return '';
  }

  return cleanText(
    String(
      wedding._id ||
        wedding.id ||
        wedding.slug ||
        ''
    )
  );
}

function normalizeWedding(wedding) {
  if (!wedding || typeof wedding !== 'object') {
    return null;
  }

  const groomName = cleanText(
    wedding.groomName ||
      wedding.novio
  );

  const brideName = cleanText(
    wedding.brideName ||
      wedding.novia
  );

  const slug = cleanText(wedding.slug);

  const eventDate = cleanText(
    wedding.eventDate ||
      wedding.fecha
  );

  const venueName = cleanText(
    wedding.location?.venueName ||
      wedding.venue?.name ||
      wedding.venueName
  );

  const venueAddress = cleanText(
    wedding.location?.venueAddress ||
      wedding.venue?.address ||
      wedding.venueAddress
  );

  return {
    ...wedding,

    _id:
      wedding._id ||
      wedding.id ||
      '',

    id:
      wedding.id ||
      wedding._id ||
      '',

    groomName,
    brideName,
    slug,
    eventDate,

    venueName,
    venueAddress,

    location: {
      ...(wedding.location || {}),
      venueName,
      venueAddress,
      mapsUrl: cleanText(
        wedding.location?.mapsUrl ||
          wedding.venue?.mapsUrl ||
          wedding.mapsUrl
      )
    }
  };
}

function normalizeEventsResponse(response) {
  let source = [];

  if (Array.isArray(response)) {
    source = response;
  } else if (Array.isArray(response?.weddings)) {
    source = response.weddings;
  } else if (Array.isArray(response?.data?.weddings)) {
    source = response.data.weddings;
  } else if (Array.isArray(response?.data)) {
    source = response.data;
  }

  const eventMap = new Map();

  source
    .map(normalizeWedding)
    .filter(Boolean)
    .forEach((wedding, index) => {
      const key =
        getWeddingId(wedding) ||
        `wedding-${index}`;

      eventMap.set(key, wedding);
    });

  return Array.from(eventMap.values());
}

function normalizeCreatedWedding(response) {
  const wedding =
    response?.wedding ||
    response?.data?.wedding ||
    response?.data ||
    response;

  return normalizeWedding(wedding);
}

function getErrorMessage(
  error,
  fallbackMessage
) {
  const message = cleanText(error?.message);

  return message || fallbackMessage;
}

async function copyText(value) {
  const text = cleanText(value);

  if (!text) {
    return false;
  }

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(text);

      return true;
    } catch {
      // Usamos el método alternativo.
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  try {
    const textarea =
      document.createElement('textarea');

    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    textarea.select();

    const copied =
      document.execCommand('copy');

    textarea.remove();

    return copied;
  } catch {
    return false;
  }
}

export default function useWeddingEvents({
  setError,
  setSuccessMessage,
  autoLoad = true
} = {}) {
  const [events, setEvents] = useState([]);

  const [
    generatedWedding,
    setGeneratedWedding
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    loadingEvents,
    setLoadingEvents
  ] = useState(false);

  const [
    deletingEventId,
    setDeletingEventId
  ] = useState(null);

  const mountedRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const clearMessages = useCallback(() => {
    if (typeof setError === 'function') {
      setError('');
    }

    if (
      typeof setSuccessMessage === 'function'
    ) {
      setSuccessMessage('');
    }
  }, [
    setError,
    setSuccessMessage
  ]);

  const showError = useCallback(
    (message) => {
      if (typeof setError === 'function') {
        setError(message);
      }
    },
    [setError]
  );

  const showSuccess = useCallback(
    (message) => {
      if (
        typeof setSuccessMessage ===
        'function'
      ) {
        setSuccessMessage(message);
      }
    },
    [setSuccessMessage]
  );

  const getWeddingUrl = useCallback(
    (wedding) => {
      const slug = cleanText(
        wedding?.slug
      );

      if (
        !slug ||
        typeof window === 'undefined'
      ) {
        return '';
      }

      return `${window.location.origin}/boda/${encodeURIComponent(
        slug
      )}`;
    },
    []
  );

  const generatedUrl = useMemo(() => {
    return getWeddingUrl(
      generatedWedding
    );
  }, [
    generatedWedding,
    getWeddingUrl
  ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      loadRequestIdRef.current += 1;
    };
  }, []);

  const loadEvents =
    useCallback(async () => {
      const requestId =
        loadRequestIdRef.current + 1;

      loadRequestIdRef.current =
        requestId;

      try {
        setLoadingEvents(true);
        clearMessages();

        const response =
          await getWeddings();

        if (
          !mountedRef.current ||
          requestId !==
            loadRequestIdRef.current
        ) {
          return [];
        }

        const normalizedEvents =
          normalizeEventsResponse(
            response
          );

        setEvents(normalizedEvents);

        return normalizedEvents;
      } catch (requestError) {
        if (!mountedRef.current) {
          return [];
        }

        showError(
          getErrorMessage(
            requestError,
            'No fue posible cargar las invitaciones.'
          )
        );

        return [];
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            loadRequestIdRef.current
        ) {
          setLoadingEvents(false);
        }
      }
    }, [
      clearMessages,
      showError
    ]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadEvents();
  }, [
    autoLoad,
    loadEvents
  ]);

  const addEventLocally =
    useCallback((wedding) => {
      const normalizedWedding =
        normalizeWedding(wedding);

      if (!normalizedWedding) {
        return false;
      }

      const weddingId =
        getWeddingId(
          normalizedWedding
        );

      setEvents((currentEvents) => {
        const currentNormalized =
          normalizeEventsResponse(
            currentEvents
          );

        const existingIndex =
          currentNormalized.findIndex(
            (event) =>
              getWeddingId(event) ===
              weddingId
          );

        if (
          existingIndex === -1
        ) {
          return [
            normalizedWedding,
            ...currentNormalized
          ];
        }

        return currentNormalized.map(
          (event) =>
            getWeddingId(event) ===
            weddingId
              ? normalizedWedding
              : event
        );
      });

      return true;
    }, []);

  const createEvent =
    useCallback(
      async (payload) => {
        if (
          !payload ||
          typeof payload !== 'object'
        ) {
          showError(
            'No se encontró la información de la invitación.'
          );

          return null;
        }

        try {
          setLoading(true);
          clearMessages();
          setGeneratedWedding(null);

          const response =
            await createWedding(payload);

          if (!mountedRef.current) {
            return null;
          }

          const wedding =
            normalizeCreatedWedding(
              response
            );

          if (!wedding) {
            throw new Error(
              'El servidor no devolvió la invitación creada.'
            );
          }

          if (!wedding.slug) {
            throw new Error(
              'La invitación fue guardada, pero el servidor no devolvió un identificador público.'
            );
          }

          setGeneratedWedding(
            wedding
          );

          addEventLocally(
            wedding
          );

          showSuccess(
            'La invitación fue creada correctamente.'
          );

          return wedding;
        } catch (requestError) {
          if (!mountedRef.current) {
            return null;
          }

          showError(
            getErrorMessage(
              requestError,
              'No fue posible crear la invitación.'
            )
          );

          return null;
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      },
      [
        addEventLocally,
        clearMessages,
        showError,
        showSuccess
      ]
    );

  const removeEvent =
    useCallback(
      async (
        eventId,
        {
          askConfirmation = true
        } = {}
      ) => {
        const normalizedId =
          cleanText(
            String(eventId || '')
          );

        if (!normalizedId) {
          showError(
            'No se encontró la invitación que deseas eliminar.'
          );

          return false;
        }

        if (
          askConfirmation &&
          typeof window !== 'undefined'
        ) {
          const shouldDelete =
            window.confirm(
              '¿Estás seguro de que deseas eliminar esta invitación? Esta acción no se puede deshacer.'
            );

          if (!shouldDelete) {
            return false;
          }
        }

        try {
          setDeletingEventId(
            normalizedId
          );

          clearMessages();

          await deleteWedding(
            normalizedId
          );

          if (!mountedRef.current) {
            return false;
          }

          setEvents(
            (currentEvents) =>
              currentEvents.filter(
                (wedding) =>
                  getWeddingId(
                    wedding
                  ) !== normalizedId
              )
          );

          setGeneratedWedding(
            (currentWedding) => {
              if (
                getWeddingId(
                  currentWedding
                ) === normalizedId
              ) {
                return null;
              }

              return currentWedding;
            }
          );

          showSuccess(
            'La invitación fue eliminada correctamente.'
          );

          return true;
        } catch (requestError) {
          if (!mountedRef.current) {
            return false;
          }

          showError(
            getErrorMessage(
              requestError,
              'No fue posible eliminar la invitación.'
            )
          );

          return false;
        } finally {
          if (mountedRef.current) {
            setDeletingEventId(
              null
            );
          }
        }
      },
      [
        clearMessages,
        showError,
        showSuccess
      ]
    );

  const updateEventLocally =
    useCallback(
      (
        eventId,
        updatedData
      ) => {
        const normalizedId =
          cleanText(
            String(eventId || '')
          );

        if (
          !normalizedId ||
          !updatedData ||
          typeof updatedData !==
            'object'
        ) {
          return false;
        }

        setEvents(
          (currentEvents) =>
            currentEvents.map(
              (event) => {
                if (
                  getWeddingId(
                    event
                  ) !== normalizedId
                ) {
                  return event;
                }

                return (
                  normalizeWedding({
                    ...event,
                    ...updatedData
                  }) || event
                );
              }
            )
        );

        setGeneratedWedding(
          (currentWedding) => {
            if (
              getWeddingId(
                currentWedding
              ) !== normalizedId
            ) {
              return currentWedding;
            }

            return (
              normalizeWedding({
                ...currentWedding,
                ...updatedData
              }) ||
              currentWedding
            );
          }
        );

        return true;
      },
      []
    );

  const removeEventLocally =
    useCallback((eventId) => {
      const normalizedId =
        cleanText(
          String(eventId || '')
        );

      if (!normalizedId) {
        return false;
      }

      setEvents(
        (currentEvents) =>
          currentEvents.filter(
            (event) =>
              getWeddingId(
                event
              ) !== normalizedId
          )
      );

      return true;
    }, []);

  const clearGeneratedWedding =
    useCallback(() => {
      setGeneratedWedding(null);
    }, []);

  const copyWeddingUrl =
    useCallback(
      async (wedding) => {
        const weddingUrl =
          getWeddingUrl(wedding);

        if (!weddingUrl) {
          showError(
            'La invitación todavía no tiene un enlace público.'
          );

          return false;
        }

        const copied =
          await copyText(
            weddingUrl
          );

        if (!copied) {
          showError(
            'No fue posible copiar el enlace.'
          );

          return false;
        }

        showSuccess(
          'El enlace público fue copiado.'
        );

        return true;
      },
      [
        getWeddingUrl,
        showError,
        showSuccess
      ]
    );

  const copyGeneratedUrl =
    useCallback(async () => {
      if (!generatedWedding) {
        showError(
          'Todavía no hay una invitación creada.'
        );

        return false;
      }

      return copyWeddingUrl(
        generatedWedding
      );
    }, [
      copyWeddingUrl,
      generatedWedding,
      showError
    ]);

  const formatEventDate =
    useCallback((dateValue) => {
      const normalizedDate =
        cleanText(dateValue);

      if (!normalizedDate) {
        return '';
      }

      return (
        formatWeddingDate(
          normalizedDate
        ) || ''
      );
    }, []);

  const findEventById =
    useCallback(
      (eventId) => {
        const normalizedId =
          cleanText(
            String(eventId || '')
          );

        if (!normalizedId) {
          return null;
        }

        return (
          events.find(
            (event) =>
              getWeddingId(
                event
              ) === normalizedId
          ) || null
        );
      },
      [events]
    );

  const findEventBySlug =
    useCallback(
      (slug) => {
        const normalizedSlug =
          cleanText(slug);

        if (!normalizedSlug) {
          return null;
        }

        return (
          events.find(
            (event) =>
              cleanText(
                event?.slug
              ) === normalizedSlug
          ) || null
        );
      },
      [events]
    );

  return {
    events,
    setEvents,

    generatedWedding,
    setGeneratedWedding,

    generatedUrl,

    loading,
    loadingEvents,
    deletingEventId,

    loadEvents,
    createEvent,
    removeEvent,

    addEventLocally,
    updateEventLocally,
    removeEventLocally,

    clearGeneratedWedding,

    getWeddingUrl,
    copyWeddingUrl,
    copyGeneratedUrl,

    formatEventDate,

    findEventById,
    findEventBySlug
  };
}