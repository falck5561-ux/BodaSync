import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function clampVolume(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(0, numericValue)
  );
}

function getServerOrigin() {
  const configuredApiUrl = cleanText(
    import.meta.env.VITE_API_URL ||
      'http://localhost:5000/api'
  );

  try {
    return new URL(
      configuredApiUrl
    ).origin;
  } catch {
    return 'http://localhost:5000';
  }
}

function resolveAudioUrl(value) {
  let audioValue = value;

  if (
    audioValue &&
    typeof audioValue === 'object'
  ) {
    audioValue =
      audioValue.url ||
      audioValue.secureUrl ||
      audioValue.secure_url ||
      audioValue.fileUrl ||
      audioValue.path ||
      '';
  }

  const audioUrl = cleanText(
    audioValue
  );

  if (!audioUrl) {
    return '';
  }

  if (
    audioUrl.startsWith('blob:') ||
    audioUrl.startsWith('data:')
  ) {
    return audioUrl;
  }

  if (/^https?:\/\//i.test(audioUrl)) {
    return audioUrl;
  }

  const serverOrigin =
    getServerOrigin();

  if (
    audioUrl.startsWith('/uploads/')
  ) {
    return `${serverOrigin}${audioUrl}`;
  }

  if (
    audioUrl.startsWith('uploads/')
  ) {
    return `${serverOrigin}/${audioUrl}`;
  }

  if (audioUrl.startsWith('/')) {
    return audioUrl;
  }

  return `${serverOrigin}/${audioUrl}`;
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError'
  );
}

function isAutoplayError(error) {
  return (
    error?.name ===
    'NotAllowedError'
  );
}

function setSafeVolume(
  audio,
  value
) {
  if (!audio) {
    return;
  }

  const safeVolume =
    clampVolume(value);

  try {
    audio.volume = safeVolume;
  } catch (error) {
    console.warn(
      'No se pudo cambiar el volumen:',
      error
    );
  }
}

export default function useSmartAudio(
  url,
  options = {}
) {
  const {
    loop = true,
    volume = 0.85,
    fadeInDuration = 1800,
    fadeOutDuration = 700,
    pauseWhenHidden = true
  } = options;

  const targetVolume = useMemo(
    () => clampVolume(volume),
    [volume]
  );

  const resolvedUrl = useMemo(
    () => resolveAudioUrl(url),
    [url]
  );

  const audioRef = useRef(null);

  const fadeFrameRef =
    useRef(null);

  const shouldPlayRef =
    useRef(false);

  const mountedRef =
    useRef(false);

  const [
    playing,
    setPlayingState
  ] = useState(false);

  const [
    ready,
    setReady
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const clearFade =
    useCallback(() => {
      if (
        fadeFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          fadeFrameRef.current
        );

        fadeFrameRef.current =
          null;
      }
    }, []);

  const fadeVolume =
    useCallback(
      ({
        from,
        to,
        duration,
        onComplete
      }) => {
        const audio =
          audioRef.current;

        if (!audio) {
          onComplete?.();
          return;
        }

        clearFade();

        const safeFrom =
          clampVolume(from);

        const safeTo =
          clampVolume(to);

        const safeDuration =
          Math.max(
            0,
            Number(duration) || 0
          );

        if (safeDuration === 0) {
          setSafeVolume(
            audio,
            safeTo
          );

          onComplete?.();

          return;
        }

        const startedAt =
          performance.now();

        setSafeVolume(
          audio,
          safeFrom
        );

        function updateVolume(
          currentTime
        ) {
          if (!audioRef.current) {
            return;
          }

          const elapsed =
            Math.max(
              0,
              currentTime -
                startedAt
            );

          /*
           * MUY IMPORTANTE:
           * progress NUNCA podrá pasar de 1.
           */
          const progress =
            Math.min(
              1,
              Math.max(
                0,
                elapsed /
                  safeDuration
              )
            );

          const nextVolume =
            safeFrom +
            (safeTo -
              safeFrom) *
              progress;

          /*
           * Segunda protección.
           * Aunque hubiera un cálculo raro,
           * el valor final queda entre 0 y 1.
           */
          setSafeVolume(
            audio,
            nextVolume
          );

          if (progress >= 1) {
            fadeFrameRef.current =
              null;

            setSafeVolume(
              audio,
              safeTo
            );

            onComplete?.();

            return;
          }

          fadeFrameRef.current =
            requestAnimationFrame(
              updateVolume
            );
        }

        fadeFrameRef.current =
          requestAnimationFrame(
            updateVolume
          );
      },
      [clearFade]
    );

  const playAudio =
    useCallback(async () => {
      const audio =
        audioRef.current;

      if (!audio || !resolvedUrl) {
        return false;
      }

      shouldPlayRef.current = true;

      clearFade();

      setError('');

      try {
        /*
         * Arrancamos desde volumen 0
         * para aplicar fade-in.
         */
        setSafeVolume(audio, 0);

        const playResult =
          audio.play();

        if (
          playResult &&
          typeof playResult.then ===
            'function'
        ) {
          await playResult;
        }

        if (
          !mountedRef.current ||
          !shouldPlayRef.current
        ) {
          return false;
        }

        setPlayingState(true);

        fadeVolume({
          from: 0,
          to: targetVolume,
          duration:
            fadeInDuration
        });

        return true;
      } catch (playError) {
        if (
          isAbortError(playError)
        ) {
          return false;
        }

        shouldPlayRef.current =
          false;

        setPlayingState(false);

        if (
          isAutoplayError(
            playError
          )
        ) {
          setError(
            'El navegador bloqueó la reproducción automática. Toca el botón de música para reproducirla.'
          );
        } else {
          setError(
            'No fue posible reproducir la música.'
          );
        }

        console.warn(
          'Error reproduciendo audio:',
          playError
        );

        return false;
      }
    }, [
      clearFade,
      fadeInDuration,
      fadeVolume,
      resolvedUrl,
      targetVolume
    ]);

  const pauseAudio =
    useCallback(
      ({
        immediate = false
      } = {}) => {
        const audio =
          audioRef.current;

        if (!audio) {
          return;
        }

        shouldPlayRef.current =
          false;

        clearFade();

        if (immediate) {
          audio.pause();

          setSafeVolume(
            audio,
            targetVolume
          );

          setPlayingState(false);

          return;
        }

        const currentVolume =
          clampVolume(
            audio.volume
          );

        fadeVolume({
          from: currentVolume,
          to: 0,
          duration:
            fadeOutDuration,

          onComplete: () => {
            const currentAudio =
              audioRef.current;

            if (!currentAudio) {
              return;
            }

            currentAudio.pause();

            /*
             * Dejamos preparado el volumen
             * para la siguiente reproducción.
             */
            setSafeVolume(
              currentAudio,
              targetVolume
            );

            if (
              mountedRef.current
            ) {
              setPlayingState(
                false
              );
            }
          }
        });
      },
      [
        clearFade,
        fadeOutDuration,
        fadeVolume,
        targetVolume
      ]
    );

  const toggleAudio =
    useCallback(() => {
      const audio =
        audioRef.current;

      if (!audio) {
        return;
      }

      if (
        playing ||
        !audio.paused
      ) {
        pauseAudio();
        return;
      }

      void playAudio();
    }, [
      pauseAudio,
      playAudio,
      playing
    ]);

  const setPlaying =
    useCallback(
      (nextValue) => {
        const resolvedValue =
          typeof nextValue ===
          'function'
            ? Boolean(
                nextValue(
                  playing
                )
              )
            : Boolean(
                nextValue
              );

        if (resolvedValue) {
          void playAudio();
          return;
        }

        pauseAudio();
      },
      [
        pauseAudio,
        playAudio,
        playing
      ]
    );

  const stopAudio =
    useCallback(() => {
      const audio =
        audioRef.current;

      if (!audio) {
        return;
      }

      shouldPlayRef.current =
        false;

      clearFade();

      audio.pause();

      try {
        audio.currentTime = 0;
      } catch {
        // Algunos navegadores pueden impedirlo
        // antes de cargar metadata.
      }

      setSafeVolume(
        audio,
        targetVolume
      );

      setPlayingState(false);
    }, [
      clearFade,
      targetVolume
    ]);

  const restartAudio =
    useCallback(async () => {
      const audio =
        audioRef.current;

      if (!audio) {
        return false;
      }

      clearFade();

      try {
        audio.currentTime = 0;
      } catch {
        // No bloqueamos la reproducción.
      }

      return playAudio();
    }, [
      clearFade,
      playAudio
    ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    clearFade();

    shouldPlayRef.current =
      false;

    setPlayingState(false);
    setReady(false);
    setError('');

    if (!resolvedUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      audioRef.current = null;

      return undefined;
    }

    const audio =
      new Audio();

    audio.preload = 'auto';
    audio.loop = Boolean(loop);

    /*
     * Siempre un valor seguro.
     */
    setSafeVolume(
      audio,
      targetVolume
    );

    audioRef.current = audio;

    function handleCanPlay() {
      if (!mountedRef.current) {
        return;
      }

      setReady(true);
      setError('');
    }

    function handleLoadedData() {
      if (!mountedRef.current) {
        return;
      }

      setReady(true);
    }

    function handlePlay() {
      if (!mountedRef.current) {
        return;
      }

      setPlayingState(true);
    }

    function handlePause() {
      if (
        !mountedRef.current ||
        shouldPlayRef.current
      ) {
        return;
      }

      setPlayingState(false);
    }

    function handleEnded() {
      if (!mountedRef.current) {
        return;
      }

      if (!loop) {
        shouldPlayRef.current =
          false;

        setPlayingState(false);
      }
    }

    function handleError() {
      if (!mountedRef.current) {
        return;
      }

      shouldPlayRef.current =
        false;

      setPlayingState(false);
      setReady(false);

      setError(
        'No fue posible cargar la música.'
      );
    }

    audio.addEventListener(
      'canplay',
      handleCanPlay
    );

    audio.addEventListener(
      'loadeddata',
      handleLoadedData
    );

    audio.addEventListener(
      'play',
      handlePlay
    );

    audio.addEventListener(
      'pause',
      handlePause
    );

    audio.addEventListener(
      'ended',
      handleEnded
    );

    audio.addEventListener(
      'error',
      handleError
    );

    /*
     * Asignamos src DESPUÉS de registrar
     * listeners.
     */
    audio.src = resolvedUrl;

    audio.load();

    return () => {
      shouldPlayRef.current =
        false;

      clearFade();

      audio.removeEventListener(
        'canplay',
        handleCanPlay
      );

      audio.removeEventListener(
        'loadeddata',
        handleLoadedData
      );

      audio.removeEventListener(
        'play',
        handlePlay
      );

      audio.removeEventListener(
        'pause',
        handlePause
      );

      audio.removeEventListener(
        'ended',
        handleEnded
      );

      audio.removeEventListener(
        'error',
        handleError
      );

      audio.pause();

      audio.src = '';

      if (
        audioRef.current ===
        audio
      ) {
        audioRef.current =
          null;
      }
    };
  }, [
    clearFade,
    loop,
    resolvedUrl,
    targetVolume
  ]);

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (!playing) {
      setSafeVolume(
        audio,
        targetVolume
      );
    }
  }, [
    playing,
    targetVolume
  ]);

  useEffect(() => {
    if (
      !pauseWhenHidden ||
      typeof document ===
        'undefined'
    ) {
      return undefined;
    }

    function handleVisibilityChange() {
      const audio =
        audioRef.current;

      if (!audio) {
        return;
      }

      if (document.hidden) {
        if (!audio.paused) {
          audio.pause();
        }

        return;
      }

      if (
        shouldPlayRef.current
      ) {
        void playAudio();
      }
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [
    pauseWhenHidden,
    playAudio
  ]);

  const controls = useMemo(
    () => ({
      ready,
      error,

      hasAudio:
        Boolean(resolvedUrl),

      resolvedUrl,

      audioRef,

      playAudio,
      pauseAudio,
      toggleAudio,
      stopAudio,
      restartAudio
    }),
    [
      error,
      pauseAudio,
      playAudio,
      ready,
      resolvedUrl,
      restartAudio,
      stopAudio,
      toggleAudio
    ]
  );

  return [
    playing,
    setPlaying,
    controls
  ];
}