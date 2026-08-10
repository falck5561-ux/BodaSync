import {
  useMemo,
  useState
} from 'react';

export const DEFAULT_BUSINESS_NAME =
  'BodaSync';

export const DEFAULT_WELCOME_MESSAGE =
  'Nos llena de alegría compartir este momento contigo.';

const BUSINESS_NAME_KEY =
  'bodasync_business_name';

const DEFAULT_MESSAGE_KEY =
  'bodasync_default_message';

function getStoredValue(
  key,
  defaultValue
) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  const storedValue =
    window.localStorage.getItem(key);

  return storedValue?.trim() ||
    defaultValue;
}

export function getInitialAdminSettings() {
  return {
    businessName: getStoredValue(
      BUSINESS_NAME_KEY,
      DEFAULT_BUSINESS_NAME
    ),

    defaultMessage: getStoredValue(
      DEFAULT_MESSAGE_KEY,
      DEFAULT_WELCOME_MESSAGE
    )
  };
}

export default function useAdminSettings({
  setError,
  setSuccessMessage,
  onDefaultMessageSaved
} = {}) {
  const [settings, setSettings] =
    useState(getInitialAdminSettings);

  const hasUnsavedChanges = useMemo(() => {
    const storedSettings =
      getInitialAdminSettings();

    return (
      settings.businessName.trim() !==
        storedSettings.businessName ||
      settings.defaultMessage.trim() !==
        storedSettings.defaultMessage
    );
  }, [settings]);

  function clearMessages() {
    if (typeof setError === 'function') {
      setError('');
    }

    if (
      typeof setSuccessMessage ===
      'function'
    ) {
      setSuccessMessage('');
    }
  }

  function showError(message) {
    if (typeof setError === 'function') {
      setError(message);
    }
  }

  function showSuccess(message) {
    if (
      typeof setSuccessMessage ===
      'function'
    ) {
      setSuccessMessage(message);
    }
  }

  function updateSetting(
    settingName,
    value
  ) {
    const allowedSettings = [
      'businessName',
      'defaultMessage'
    ];

    if (
      !allowedSettings.includes(
        settingName
      )
    ) {
      return;
    }

    setSettings(
      (currentSettings) => ({
        ...currentSettings,
        [settingName]: value
      })
    );
  }

  function handleSettingChange(event) {
    const { name, value } =
      event.target;

    updateSetting(name, value);
  }

  function handleBusinessNameChange(
    event
  ) {
    updateSetting(
      'businessName',
      event.target.value
    );
  }

  function handleDefaultMessageChange(
    event
  ) {
    updateSetting(
      'defaultMessage',
      event.target.value
    );
  }

  function validateSettings() {
    if (
      !settings.businessName.trim()
    ) {
      showError(
        'Escribe el nombre del panel.'
      );

      return false;
    }

    if (
      settings.businessName.trim()
        .length > 60
    ) {
      showError(
        'El nombre del panel no debe superar los 60 caracteres.'
      );

      return false;
    }

    if (
      !settings.defaultMessage.trim()
    ) {
      showError(
        'Escribe el mensaje predeterminado.'
      );

      return false;
    }

    if (
      settings.defaultMessage.trim()
        .length > 500
    ) {
      showError(
        'El mensaje predeterminado no debe superar los 500 caracteres.'
      );

      return false;
    }

    return true;
  }

  function saveSettings(event) {
    event?.preventDefault();

    clearMessages();

    if (!validateSettings()) {
      return false;
    }

    const cleanSettings = {
      businessName:
        settings.businessName.trim(),

      defaultMessage:
        settings.defaultMessage.trim()
    };

    if (
      typeof window !== 'undefined'
    ) {
      window.localStorage.setItem(
        BUSINESS_NAME_KEY,
        cleanSettings.businessName
      );

      window.localStorage.setItem(
        DEFAULT_MESSAGE_KEY,
        cleanSettings.defaultMessage
      );
    }

    setSettings(cleanSettings);

    if (
      typeof onDefaultMessageSaved ===
      'function'
    ) {
      onDefaultMessageSaved(
        cleanSettings.defaultMessage
      );
    }

    showSuccess(
      'Los ajustes fueron guardados correctamente.'
    );

    return true;
  }

  function resetSettings() {
    if (
      typeof window !== 'undefined'
    ) {
      window.localStorage.removeItem(
        BUSINESS_NAME_KEY
      );

      window.localStorage.removeItem(
        DEFAULT_MESSAGE_KEY
      );
    }

    const defaultSettings = {
      businessName:
        DEFAULT_BUSINESS_NAME,

      defaultMessage:
        DEFAULT_WELCOME_MESSAGE
    };

    setSettings(defaultSettings);

    if (
      typeof onDefaultMessageSaved ===
      'function'
    ) {
      onDefaultMessageSaved(
        defaultSettings.defaultMessage
      );
    }

    clearMessages();

    showSuccess(
      'Los ajustes predeterminados fueron restaurados.'
    );
  }

  function reloadSettings() {
    const storedSettings =
      getInitialAdminSettings();

    setSettings(storedSettings);
    clearMessages();
  }

  return {
    settings,
    setSettings,

    businessName:
      settings.businessName,

    defaultMessage:
      settings.defaultMessage,

    hasUnsavedChanges,

    updateSetting,
    handleSettingChange,

    handleBusinessNameChange,
    handleDefaultMessageChange,

    validateSettings,
    saveSettings,
    resetSettings,
    reloadSettings
  };
}