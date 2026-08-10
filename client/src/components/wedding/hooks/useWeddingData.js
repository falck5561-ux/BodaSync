import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  getWeddingBySlug,
  getWeddingServiceErrorMessage,
  isWeddingNotFoundError
} from '../services/weddingPublicService';

import {
  isWeddingSectionEnabled,
  mapWeddingData
} from '../utils/weddingMapper';

function normalizeSlug(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function createInitialState(initialWedding = null) {
  return {
    wedding: initialWedding,
    loading: false,
    error: '',
    errorCode: '',
    notFound: false,
    lastUpdated: null
  };
}

export function useWeddingData(slug, options = {}) {
  const {
    enabled = true,
    initialData = null,
    onSuccess,
    onError
  } = options;

  const normalizedSlug = normalizeSlug(slug);

  const initialWedding = useMemo(() => {
    if (!initialData) {
      return null;
    }

    return mapWeddingData(
      initialData,
      normalizedSlug
    );
  }, [initialData, normalizedSlug]);

  const [state, setState] = useState(() =>
    createInitialState(initialWedding)
  );

  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadWedding = useCallback(
    async ({ showLoading = true } = {}) => {
      const currentRequestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        currentRequestId;

      abortControllerRef.current?.abort();

      if (!enabled) {
        setState((currentState) => ({
          ...currentState,
          loading: false
        }));

        return null;
      }

      if (!normalizedSlug) {
        setState({
          wedding: null,
          loading: false,
          error:
            'No se proporcionó el identificador de la invitación.',
          errorCode:
            'INVALID_WEDDING_SLUG',
          notFound: false,
          lastUpdated: null
        });

        return null;
      }

      const controller =
        new AbortController();

      abortControllerRef.current =
        controller;

      if (showLoading) {
        setState((currentState) => ({
          ...currentState,
          loading: true,
          error: '',
          errorCode: '',
          notFound: false
        }));
      }

      try {
        const response =
          await getWeddingBySlug(
            normalizedSlug,
            {
              signal: controller.signal
            }
          );

        if (
          controller.signal.aborted ||
          !mountedRef.current ||
          requestIdRef.current !==
            currentRequestId
        ) {
          return null;
        }

        const mappedWedding =
          mapWeddingData(
            response,
            normalizedSlug
          );

        setState({
          wedding: mappedWedding,
          loading: false,
          error: '',
          errorCode: '',
          notFound: false,
          lastUpdated: new Date()
        });

        onSuccessRef.current?.(
          mappedWedding
        );

        return mappedWedding;
      } catch (requestError) {
        if (
          requestError?.name ===
            'AbortError' ||
          controller.signal.aborted ||
          !mountedRef.current ||
          requestIdRef.current !==
            currentRequestId
        ) {
          return null;
        }

        const notFound =
          isWeddingNotFoundError(
            requestError
          );

        const message =
          getWeddingServiceErrorMessage(
            requestError
          );

        setState({
          wedding: null,
          loading: false,
          error: message,
          errorCode:
            requestError?.code ||
            'WEDDING_REQUEST_ERROR',
          notFound,
          lastUpdated: null
        });

        onErrorRef.current?.(
          requestError
        );

        return null;
      }
    },
    [
      enabled,
      normalizedSlug
    ]
  );

  useEffect(() => {
    loadWedding();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadWedding]);

  const reloadWedding =
    useCallback(() => {
      return loadWedding({
        showLoading: true
      });
    }, [loadWedding]);

  const refreshWedding =
    useCallback(() => {
      return loadWedding({
        showLoading: false
      });
    }, [loadWedding]);

  const clearError =
    useCallback(() => {
      setState((currentState) => ({
        ...currentState,
        error: '',
        errorCode: '',
        notFound: false
      }));
    }, []);

  const updateWedding =
    useCallback((nextWedding) => {
      setState((currentState) => {
        const resolvedWedding =
          typeof nextWedding ===
          'function'
            ? nextWedding(
                currentState.wedding
              )
            : nextWedding;

        if (!resolvedWedding) {
          return {
            ...currentState,
            wedding: null,
            lastUpdated: null
          };
        }

        const weddingSlug =
          resolvedWedding.slug ||
          currentState.wedding?.slug ||
          normalizedSlug;

        return {
          ...currentState,
          wedding: mapWeddingData(
            resolvedWedding,
            weddingSlug
          ),
          error: '',
          errorCode: '',
          notFound: false,
          lastUpdated: new Date()
        };
      });
    }, [normalizedSlug]);

  const clearWedding =
    useCallback(() => {
      abortControllerRef.current?.abort();

      setState(
        createInitialState()
      );
    }, []);

  const sectionEnabled =
    useCallback(
      (sectionName) => {
        return isWeddingSectionEnabled(
          state.wedding,
          sectionName
        );
      },
      [state.wedding]
    );

  const status = useMemo(() => {
    if (state.loading) {
      return 'loading';
    }

    if (state.notFound) {
      return 'not-found';
    }

    if (state.error) {
      return 'error';
    }

    if (state.wedding) {
      return 'success';
    }

    return 'idle';
  }, [
    state.error,
    state.loading,
    state.notFound,
    state.wedding
  ]);

  return {
    wedding: state.wedding,
    loading: state.loading,
    error: state.error,
    errorCode: state.errorCode,
    notFound: state.notFound,
    lastUpdated: state.lastUpdated,

    status,

    hasWedding: Boolean(
      state.wedding
    ),

    isIdle:
      status === 'idle',

    isLoading:
      status === 'loading',

    isSuccess:
      status === 'success',

    isError:
      status === 'error',

    isNotFound:
      status === 'not-found',

    reloadWedding,
    reload: reloadWedding,

    refreshWedding,

    clearError,
    clearWedding,

    updateWedding,
    setWedding: updateWedding,

    sectionEnabled
  };
}

export default useWeddingData;