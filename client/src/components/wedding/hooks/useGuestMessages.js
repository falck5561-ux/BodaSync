import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  getGuestMessages,
  getGuestServiceErrorMessage
} from '../services/guestService';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeSlug(value) {
  return cleanText(value);
}

function normalizeMessage(message, index = 0) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const content = cleanText(
    message.message ||
      message.mensaje ||
      message.content ||
      message.text
  );

  const author = cleanText(
    message.author ||
      message.nombre ||
      message.name
  );

  if (!content || !author) {
    return null;
  }

  const createdAt = cleanText(
    message.createdAt ||
      message.created_at ||
      message.date
  );

  const id =
    cleanText(message.id) ||
    cleanText(message._id) ||
    `guest-message-${index + 1}-${author}-${content.slice(0, 20)}`;

  return {
    id,
    message: content,
    author,
    createdAt
  };
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message, index) =>
      normalizeMessage(message, index)
    )
    .filter(Boolean);
}

function removeDuplicateMessages(messages) {
  const messageMap = new Map();

  messages.forEach((message) => {
    if (!message?.id) {
      return;
    }

    messageMap.set(
      String(message.id),
      message
    );
  });

  return Array.from(
    messageMap.values()
  );
}

function normalizeInitialMessages(messages) {
  return removeDuplicateMessages(
    normalizeMessages(messages)
  );
}

export function useGuestMessages(
  slug,
  options = {}
) {
  const {
    enabled = true,
    autoLoad = true,
    initialMessages = [],
    onSuccess,
    onError
  } = options;

  const normalizedSlug =
    normalizeSlug(slug);

  const [
    messages,
    setMessagesState
  ] = useState(() =>
    normalizeInitialMessages(
      initialMessages
    )
  );

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    lastUpdated,
    setLastUpdated
  ] = useState(null);

  const abortControllerRef =
    useRef(null);

  const requestIdRef =
    useRef(0);

  const mountedRef =
    useRef(false);

  const activeSlugRef =
    useRef(normalizedSlug);

  const onSuccessRef =
    useRef(onSuccess);

  const onErrorRef =
    useRef(onError);

  useEffect(() => {
    onSuccessRef.current =
      onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current =
      onError;
  }, [onError]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (
      activeSlugRef.current ===
      normalizedSlug
    ) {
      return;
    }

    activeSlugRef.current =
      normalizedSlug;

    requestIdRef.current += 1;

    abortControllerRef.current?.abort();

    setMessagesState([]);
    setLoading(false);
    setError('');
    setLastUpdated(null);
  }, [normalizedSlug]);

  const loadMessages = useCallback(
    async ({
      showLoading = true
    } = {}) => {
      if (
        !enabled ||
        !normalizedSlug
      ) {
        abortControllerRef.current?.abort();

        setLoading(false);
        setError('');

        return [];
      }

      const currentRequestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        currentRequestId;

      abortControllerRef.current?.abort();

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      if (showLoading) {
        setLoading(true);
      }

      setError('');

      try {
        const response =
          await getGuestMessages(
            normalizedSlug,
            {
              signal:
                controller.signal
            }
          );

        if (
          controller.signal.aborted ||
          !mountedRef.current ||
          requestIdRef.current !==
            currentRequestId ||
          activeSlugRef.current !==
            normalizedSlug
        ) {
          return [];
        }

        const normalizedMessages =
          removeDuplicateMessages(
            normalizeMessages(
              response
            )
          );

        setMessagesState(
          normalizedMessages
        );

        setLoading(false);
        setError('');
        setLastUpdated(
          new Date()
        );

        onSuccessRef.current?.(
          normalizedMessages
        );

        return normalizedMessages;
      } catch (requestError) {
        if (
          requestError?.name ===
            'AbortError' ||
          controller.signal.aborted ||
          !mountedRef.current ||
          requestIdRef.current !==
            currentRequestId
        ) {
          return [];
        }

        const errorMessage =
          getGuestServiceErrorMessage(
            requestError
          );

        setLoading(false);
        setError(errorMessage);

        onErrorRef.current?.(
          requestError
        );

        return [];
      } finally {
        if (
          abortControllerRef.current ===
          controller
        ) {
          abortControllerRef.current =
            null;
        }
      }
    },
    [
      enabled,
      normalizedSlug
    ]
  );

  useEffect(() => {
    if (
      !enabled ||
      !autoLoad ||
      !normalizedSlug
    ) {
      return undefined;
    }

    void loadMessages();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [
    autoLoad,
    enabled,
    loadMessages,
    normalizedSlug
  ]);

  useEffect(() => {
    if (enabled) {
      return;
    }

    abortControllerRef.current?.abort();

    setMessagesState([]);
    setLoading(false);
    setError('');
    setLastUpdated(null);
  }, [enabled]);

  const reloadMessages =
    useCallback(() => {
      return loadMessages({
        showLoading: true
      });
    }, [loadMessages]);

  const refreshMessages =
    useCallback(() => {
      return loadMessages({
        showLoading: false
      });
    }, [loadMessages]);

  const setMessages =
    useCallback(
      (nextMessages) => {
        setMessagesState(
          (currentMessages) => {
            const resolvedMessages =
              typeof nextMessages ===
              'function'
                ? nextMessages(
                    currentMessages
                  )
                : nextMessages;

            return removeDuplicateMessages(
              normalizeMessages(
                resolvedMessages
              )
            );
          }
        );
      },
      []
    );

  const addMessage =
    useCallback((message) => {
      const normalizedMessage =
        normalizeMessage(message);

      if (!normalizedMessage) {
        return false;
      }

      setMessagesState(
        (currentMessages) =>
          removeDuplicateMessages([
            normalizedMessage,
            ...currentMessages
          ])
      );

      return true;
    }, []);

  const appendMessage =
    useCallback((message) => {
      const normalizedMessage =
        normalizeMessage(message);

      if (!normalizedMessage) {
        return false;
      }

      setMessagesState(
        (currentMessages) =>
          removeDuplicateMessages([
            ...currentMessages,
            normalizedMessage
          ])
      );

      return true;
    }, []);

  const updateMessage =
    useCallback(
      (
        messageId,
        updates
      ) => {
        const normalizedId =
          cleanText(
            String(
              messageId || ''
            )
          );

        if (!normalizedId) {
          return false;
        }

        setMessagesState(
          (currentMessages) =>
            currentMessages
              .map(
                (
                  currentMessage,
                  index
                ) => {
                  if (
                    String(
                      currentMessage.id
                    ) !== normalizedId
                  ) {
                    return currentMessage;
                  }

                  return (
                    normalizeMessage(
                      {
                        ...currentMessage,
                        ...updates,
                        id: currentMessage.id
                      },
                      index
                    ) ||
                    currentMessage
                  );
                }
              )
        );

        return true;
      },
      []
    );

  const removeMessage =
    useCallback((messageId) => {
      const normalizedId =
        cleanText(
          String(
            messageId || ''
          )
        );

      if (!normalizedId) {
        return false;
      }

      setMessagesState(
        (currentMessages) =>
          currentMessages.filter(
            (message) =>
              String(message.id) !==
              normalizedId
          )
      );

      return true;
    }, []);

  const clearMessages =
    useCallback(() => {
      setMessagesState([]);
    }, []);

  const clearError =
    useCallback(() => {
      setError('');
    }, []);

  const cancelLoading =
    useCallback(() => {
      requestIdRef.current += 1;

      abortControllerRef.current?.abort();

      abortControllerRef.current =
        null;

      setLoading(false);
    }, []);

  const messageCount =
    messages.length;

  const hasMessages =
    messageCount > 0;

  const status = useMemo(() => {
    if (loading) {
      return 'loading';
    }

    if (error) {
      return 'error';
    }

    if (hasMessages) {
      return 'success';
    }

    return 'empty';
  }, [
    error,
    hasMessages,
    loading
  ]);

  return {
    messages,
    loading,
    error,
    lastUpdated,

    status,

    messageCount,
    hasMessages,

    isEmpty:
      !loading &&
      !error &&
      !hasMessages,

    isLoading:
      loading,

    isError:
      Boolean(error),

    loadMessages,

    reloadMessages,
    reload: reloadMessages,

    refreshMessages,

    setMessages,

    addMessage,
    prependMessage:
      addMessage,

    appendMessage,
    updateMessage,
    removeMessage,

    clearMessages,
    clearError,
    cancelLoading
  };
}

export default useGuestMessages;