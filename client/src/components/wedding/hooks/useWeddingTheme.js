import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_STORAGE_KEY = 'weddingTheme';

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function normalizeThemeMode(value, fallback = 'light') {
  if (value === 'dark' || value === true) {
    return 'dark';
  }

  if (value === 'light' || value === false) {
    return 'light';
  }

  return fallback === 'dark' ? 'dark' : 'light';
}

function readStoredTheme(storageKey) {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (storedValue === null) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(storedValue);
      return normalizeThemeMode(parsedValue, null);
    } catch {
      return normalizeThemeMode(storedValue, null);
    }
  } catch {
    return null;
  }
}

function saveStoredTheme(storageKey, mode) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(mode === 'dark')
    );
  } catch {
    // La invitación continúa funcionando aunque localStorage no esté disponible.
  }
}

function removeStoredTheme(storageKey) {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // No es necesario detener la aplicación si no puede eliminarse.
  }
}

export function useWeddingTheme(options = {}) {
  const {
    initialMode = 'light',
    allowToggle = true,
    storageKey = DEFAULT_STORAGE_KEY
  } = options;

  const normalizedInitialMode = normalizeThemeMode(initialMode);

  const [themeMode, setThemeModeState] = useState(() => {
    const storedTheme = readStoredTheme(storageKey);

    return storedTheme || normalizedInitialMode;
  });

  const isDark = themeMode === 'dark';

  useEffect(() => {
    const storedTheme = readStoredTheme(storageKey);

    if (!storedTheme) {
      setThemeModeState(normalizedInitialMode);
    }
  }, [normalizedInitialMode, storageKey]);

  useEffect(() => {
    saveStoredTheme(storageKey, themeMode);
  }, [storageKey, themeMode]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.dataset.weddingTheme = themeMode;

    return () => {
      delete document.documentElement.dataset.weddingTheme;
    };
  }, [themeMode]);

  const setThemeMode = useCallback(
    (nextMode) => {
      if (!allowToggle) {
        return;
      }

      setThemeModeState((currentMode) => {
        if (typeof nextMode === 'function') {
          return normalizeThemeMode(
            nextMode(currentMode),
            currentMode
          );
        }

        return normalizeThemeMode(nextMode, currentMode);
      });
    },
    [allowToggle]
  );

  const setIsDark = useCallback(
    (nextValue) => {
      if (!allowToggle) {
        return;
      }

      setThemeModeState((currentMode) => {
        const currentValue = currentMode === 'dark';

        const resolvedValue =
          typeof nextValue === 'function'
            ? Boolean(nextValue(currentValue))
            : Boolean(nextValue);

        return resolvedValue ? 'dark' : 'light';
      });
    },
    [allowToggle]
  );

  const toggleTheme = useCallback(() => {
    if (!allowToggle) {
      return;
    }

    setThemeModeState((currentMode) =>
      currentMode === 'dark' ? 'light' : 'dark'
    );
  }, [allowToggle]);

  const resetTheme = useCallback(() => {
    removeStoredTheme(storageKey);
    setThemeModeState(normalizedInitialMode);
  }, [normalizedInitialMode, storageKey]);

  const theme = useMemo(
    () => ({
      mode: themeMode,
      isDark,
      isLight: !isDark,
      allowToggle
    }),
    [allowToggle, isDark, themeMode]
  );

  return {
    theme,
    themeMode,
    isDark,
    isLight: !isDark,
    allowThemeToggle: allowToggle,
    setThemeMode,
    setIsDark,
    toggleTheme,
    resetTheme
  };
}

export default useWeddingTheme;