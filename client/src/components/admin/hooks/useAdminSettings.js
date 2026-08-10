import { useMemo, useState } from 'react';

export const DEFAULT_BUSINESS_NAME = 'BodaSync';

export const DEFAULT_WELCOME_MESSAGE =
  'Nos llena de alegría compartir este momento contigo.';

export const DEFAULT_ADMIN_SETTINGS = {
  businessName: DEFAULT_BUSINESS_NAME,
  sidebarSubtitle: 'Gestión de invitaciones',
  defaultMessage: DEFAULT_WELCOME_MESSAGE,
  defaultGuestBookTitle: 'Libro de firmas',
  defaultThemeMode: 'light',
  allowThemeToggle: true,
  confirmBeforeDelete: true,
  confirmBeforeReset: true,
  openCreatedInvitation: false,
  compactSidebar: false
};

const SETTINGS_STORAGE_KEY = 'bodasync_admin_settings_v2';
const SETTINGS_SAVED_AT_KEY = 'bodasync_admin_settings_saved_at';

/*
 * Claves antiguas.
 *
 * Las conservamos temporalmente para que quien ya
 * tenga configuración guardada no la pierda.
 */
const LEGACY_BUSINESS_NAME_KEY = 'bodasync_business_name';
const LEGACY_DEFAULT_MESSAGE_KEY = 'bodasync_default_message';

const ALLOWED_SETTING_NAMES = Object.keys(DEFAULT_ADMIN_SETTINGS);

const ALLOWED_THEME_MODES = ['light', 'dark'];

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
}

function normalizeBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  return fallback;
}

function normalizeThemeMode(value) {
  if (ALLOWED_THEME_MODES.includes(value)) {
    return value;
  }

  return DEFAULT_ADMIN_SETTINGS.defaultThemeMode;
}

function normalizeSettings(settings = {}) {
  return {
    businessName:
      cleanText(settings.businessName) ||
      DEFAULT_ADMIN_SETTINGS.businessName,

    sidebarSubtitle:
      cleanText(settings.sidebarSubtitle) ||
      DEFAULT_ADMIN_SETTINGS.sidebarSubtitle,

    defaultMessage:
      cleanText(settings.defaultMessage) ||
      DEFAULT_ADMIN_SETTINGS.defaultMessage,

    defaultGuestBookTitle:
      cleanText(settings.defaultGuestBookTitle) ||
      DEFAULT_ADMIN_SETTINGS.defaultGuestBookTitle,

    defaultThemeMode: normalizeThemeMode(settings.defaultThemeMode),

    allowThemeToggle: normalizeBoolean(
      settings.allowThemeToggle,
      DEFAULT_ADMIN_SETTINGS.allowThemeToggle
    ),

    confirmBeforeDelete: normalizeBoolean(
      settings.confirmBeforeDelete,
      DEFAULT_ADMIN_SETTINGS.confirmBeforeDelete
    ),

    confirmBeforeReset: normalizeBoolean(
      settings.confirmBeforeReset,
      DEFAULT_ADMIN_SETTINGS.confirmBeforeReset
    ),

    openCreatedInvitation: normalizeBoolean(
      settings.openCreatedInvitation,
      DEFAULT_ADMIN_SETTINGS.openCreatedInvitation
    ),

    compactSidebar: normalizeBoolean(
      settings.compactSidebar,
      DEFAULT_ADMIN_SETTINGS.compactSidebar
    )
  };
}

function readJsonSettings() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function readLegacySettings() {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const businessName = window.localStorage.getItem(
      LEGACY_BUSINESS_NAME_KEY
    );

    const defaultMessage = window.localStorage.getItem(
      LEGACY_DEFAULT_MESSAGE_KEY
    );

    return {
      ...(businessName
        ? {
            businessName
          }
        : {}),

      ...(defaultMessage
        ? {
            defaultMessage
          }
        : {})
    };
  } catch {
    return {};
  }
}

function readLastSavedAt() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.localStorage.getItem(SETTINGS_SAVED_AT_KEY) || '';
  } catch {
    return '';
  }
}

function saveSettingsToStorage(settings) {
  if (typeof window === 'undefined') {
    return {
      success: true,
      savedAt: ''
    };
  }

  try {
    const savedAt = new Date().toISOString();

    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );

    window.localStorage.setItem(SETTINGS_SAVED_AT_KEY, savedAt);

    /*
     * Compatibilidad con código antiguo que todavía
     * pueda leer estas dos claves.
     */
    window.localStorage.setItem(
      LEGACY_BUSINESS_NAME_KEY,
      settings.businessName
    );

    window.localStorage.setItem(
      LEGACY_DEFAULT_MESSAGE_KEY,
      settings.defaultMessage
    );

    return {
      success: true,
      savedAt
    };
  } catch {
    return {
      success: false,
      savedAt: ''
    };
  }
}

function clearSettingsStorage() {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    window.localStorage.removeItem(SETTINGS_SAVED_AT_KEY);

    window.localStorage.removeItem(LEGACY_BUSINESS_NAME_KEY);
    window.localStorage.removeItem(LEGACY_DEFAULT_MESSAGE_KEY);

    return true;
  } catch {
    return false;
  }
}

export function getInitialAdminSettings() {
  const modernSettings = readJsonSettings();

  if (modernSettings) {
    return normalizeSettings(modernSettings);
  }

  /*
   * Si todavía no existe la configuración nueva,
   * recuperamos la anterior.
   */
  const legacySettings = readLegacySettings();

  return normalizeSettings({
    ...DEFAULT_ADMIN_SETTINGS,
    ...legacySettings
  });
}

export default function useAdminSettings({
  setError,
  setSuccessMessage,
  onDefaultMessageSaved,
  onSettingsSaved
} = {}) {
  const [settings, setSettings] = useState(getInitialAdminSettings);
  const [lastSavedAt, setLastSavedAt] = useState(readLastSavedAt);

  const storedSettings = useMemo(() => getInitialAdminSettings(), [settings]);

  const hasUnsavedChanges = useMemo(() => {
    const currentSettings = normalizeSettings(settings);

    return (
      JSON.stringify(currentSettings) !== JSON.stringify(storedSettings)
    );
  }, [settings, storedSettings]);

  function clearMessages() {
    if (typeof setError === 'function') {
      setError('');
    }

    if (typeof setSuccessMessage === 'function') {
      setSuccessMessage('');
    }
  }

  function showError(message) {
    if (typeof setError === 'function') {
      setError(message);
    }
  }

  function showSuccess(message) {
    if (typeof setSuccessMessage === 'function') {
      setSuccessMessage(message);
    }
  }

  function updateSetting(settingName, value) {
    if (!ALLOWED_SETTING_NAMES.includes(settingName)) {
      return;
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      [settingName]: value
    }));
  }

  function handleSettingChange(event) {
    const { checked, name, type, value } = event.target;

    updateSetting(name, type === 'checkbox' ? checked : value);
  }

  function handleBusinessNameChange(event) {
    updateSetting('businessName', event.target.value);
  }

  function handleSidebarSubtitleChange(event) {
    updateSetting('sidebarSubtitle', event.target.value);
  }

  function handleDefaultMessageChange(event) {
    updateSetting('defaultMessage', event.target.value);
  }

  function handleDefaultGuestBookTitleChange(event) {
    updateSetting('defaultGuestBookTitle', event.target.value);
  }

  function validateSettings() {
    const businessName = cleanText(settings.businessName);
    const sidebarSubtitle = cleanText(settings.sidebarSubtitle);
    const defaultMessage = cleanText(settings.defaultMessage);
    const defaultGuestBookTitle = cleanText(
      settings.defaultGuestBookTitle
    );

    if (!businessName) {
      showError('Escribe el nombre del panel.');

      return false;
    }

    if (businessName.length > 60) {
      showError(
        'El nombre del panel no debe superar los 60 caracteres.'
      );

      return false;
    }

    if (!sidebarSubtitle) {
      showError('Escribe el subtítulo del panel.');

      return false;
    }

    if (sidebarSubtitle.length > 80) {
      showError(
        'El subtítulo del panel no debe superar los 80 caracteres.'
      );

      return false;
    }

    if (!defaultMessage) {
      showError('Escribe el mensaje predeterminado.');

      return false;
    }

    /*
     * Antes SettingsSection permitía 700 caracteres
     * pero el hook solo aceptaba 500.
     *
     * Lo dejamos unificado en 700.
     */
    if (defaultMessage.length > 700) {
      showError(
        'El mensaje predeterminado no debe superar los 700 caracteres.'
      );

      return false;
    }

    if (!defaultGuestBookTitle) {
      showError(
        'Escribe el título predeterminado del libro de firmas.'
      );

      return false;
    }

    if (defaultGuestBookTitle.length > 80) {
      showError(
        'El título del libro de firmas no debe superar los 80 caracteres.'
      );

      return false;
    }

    if (!ALLOWED_THEME_MODES.includes(settings.defaultThemeMode)) {
      showError('Selecciona un modo inicial válido.');

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

    const cleanSettings = normalizeSettings(settings);

    const storageResult = saveSettingsToStorage(cleanSettings);

    if (!storageResult.success) {
      showError(
        'No fue posible guardar los ajustes en este navegador.'
      );

      return false;
    }

    setSettings(cleanSettings);
    setLastSavedAt(storageResult.savedAt);

    if (typeof onDefaultMessageSaved === 'function') {
      onDefaultMessageSaved(cleanSettings.defaultMessage);
    }

    if (typeof onSettingsSaved === 'function') {
      onSettingsSaved(cleanSettings);
    }

    showSuccess('Los ajustes fueron guardados correctamente.');

    return true;
  }

  function resetSettings() {
    clearMessages();

    const storageCleared = clearSettingsStorage();

    if (!storageCleared) {
      showError(
        'No fue posible restaurar la configuración del navegador.'
      );

      return false;
    }

    const defaultSettings = {
      ...DEFAULT_ADMIN_SETTINGS
    };

    setSettings(defaultSettings);
    setLastSavedAt('');

    if (typeof onDefaultMessageSaved === 'function') {
      onDefaultMessageSaved(defaultSettings.defaultMessage);
    }

    if (typeof onSettingsSaved === 'function') {
      onSettingsSaved(defaultSettings);
    }

    showSuccess(
      'Los ajustes predeterminados fueron restaurados.'
    );

    return true;
  }

  function reloadSettings() {
    clearMessages();

    const storedSettings = getInitialAdminSettings();

    setSettings(storedSettings);
    setLastSavedAt(readLastSavedAt());

    return storedSettings;
  }

  function getSetting(settingName) {
    if (!ALLOWED_SETTING_NAMES.includes(settingName)) {
      return undefined;
    }

    return settings[settingName];
  }

  return {
    settings,
    setSettings,

    businessName: settings.businessName,
    sidebarSubtitle: settings.sidebarSubtitle,
    defaultMessage: settings.defaultMessage,
    defaultGuestBookTitle: settings.defaultGuestBookTitle,
    defaultThemeMode: settings.defaultThemeMode,
    allowThemeToggle: settings.allowThemeToggle,
    confirmBeforeDelete: settings.confirmBeforeDelete,
    confirmBeforeReset: settings.confirmBeforeReset,
    openCreatedInvitation: settings.openCreatedInvitation,
    compactSidebar: settings.compactSidebar,

    lastSavedAt,
    hasUnsavedChanges,

    updateSetting,
    getSetting,
    handleSettingChange,

    handleBusinessNameChange,
    handleSidebarSubtitleChange,
    handleDefaultMessageChange,
    handleDefaultGuestBookTitleChange,

    validateSettings,
    saveSettings,
    resetSettings,
    reloadSettings
  };
}