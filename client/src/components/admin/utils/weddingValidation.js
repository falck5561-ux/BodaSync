import { isValidDateValue } from './dateUtils';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const CLABE_PATTERN = /^\d{18}$/;
const URL_PROTOCOL_PATTERN = /^https?:\/\//i;

function createValidationError({
  message,
  tab = 'general',
  field = ''
}) {
  return {
    valid: false,
    message,
    tab,
    field
  };
}

function createValidResult() {
  return {
    valid: true,
    message: '',
    tab: '',
    field: ''
  };
}

export function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidHttpUrl(value) {
  if (!isNonEmptyText(value)) {
    return true;
  }

  try {
    const normalizedValue = URL_PROTOCOL_PATTERN.test(value)
      ? value
      : `https://${value}`;

    const url = new URL(normalizedValue);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidHexColor(value) {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value);
}

export function isValidClabe(value) {
  if (!isNonEmptyText(value)) {
    return true;
  }

  const cleanValue = value.replace(/\s/g, '');

  return CLABE_PATTERN.test(cleanValue);
}

export function hasValidItineraryItem(itinerary) {
  if (!Array.isArray(itinerary)) {
    return false;
  }

  return itinerary.some(
    (item) =>
      isNonEmptyText(item?.time) &&
      isNonEmptyText(item?.title)
  );
}

export function hasSelectedMedia(mediaItem) {
  if (!mediaItem) {
    return false;
  }

  if (typeof mediaItem === 'string') {
    return mediaItem.trim().length > 0;
  }

  return Boolean(
    mediaItem.file ||
      mediaItem.previewUrl ||
      mediaItem.url ||
      mediaItem.secureUrl ||
      mediaItem.publicId ||
      mediaItem.name
  );
}

export function hasGalleryImages(gallery) {
  return (
    Array.isArray(gallery) &&
    gallery.some((image) => hasSelectedMedia(image))
  );
}

export function validateGeneralInformation(formData) {
  if (!isNonEmptyText(formData?.groomName)) {
    return createValidationError({
      message: 'Escribe el nombre del novio.',
      tab: 'general',
      field: 'groomName'
    });
  }

  if (!isNonEmptyText(formData?.brideName)) {
    return createValidationError({
      message: 'Escribe el nombre de la novia.',
      tab: 'general',
      field: 'brideName'
    });
  }

  if (!formData?.eventDate) {
    return createValidationError({
      message: 'Selecciona la fecha y hora del evento.',
      tab: 'general',
      field: 'eventDate'
    });
  }

  if (!isValidDateValue(formData.eventDate)) {
    return createValidationError({
      message: 'La fecha del evento no es válida.',
      tab: 'general',
      field: 'eventDate'
    });
  }

  if (!isNonEmptyText(formData?.welcomeMessage)) {
    return createValidationError({
      message: 'Escribe un mensaje de bienvenida.',
      tab: 'general',
      field: 'welcomeMessage'
    });
  }

  return createValidResult();
}

export function validateLocation(formData) {
  if (!formData?.sections?.location) {
    return createValidResult();
  }

  if (!isNonEmptyText(formData?.venueName)) {
    return createValidationError({
      message:
        'La ubicación está activa. Escribe el nombre del lugar.',
      tab: 'general',
      field: 'venueName'
    });
  }

  if (!isNonEmptyText(formData?.venueAddress)) {
    return createValidationError({
      message:
        'La ubicación está activa. Escribe la dirección del evento.',
      tab: 'general',
      field: 'venueAddress'
    });
  }

  if (
    formData.mapsUrl &&
    !isValidHttpUrl(formData.mapsUrl)
  ) {
    return createValidationError({
      message: 'El enlace de Google Maps no es válido.',
      tab: 'general',
      field: 'mapsUrl'
    });
  }

  return createValidResult();
}

export function validateParents(formData) {
  if (!formData?.sections?.parents) {
    return createValidResult();
  }

  const hasParentInformation = [
    formData.groomFather,
    formData.groomMother,
    formData.brideFather,
    formData.brideMother
  ].some((value) => isNonEmptyText(value));

  if (!hasParentInformation) {
    return createValidationError({
      message:
        'La sección de padres está activa. Escribe al menos un nombre o desactiva esta sección.',
      tab: 'content',
      field: 'groomFather'
    });
  }

  return createValidResult();
}

export function validateStory(formData) {
  if (!formData?.sections?.story) {
    return createValidResult();
  }

  if (!isNonEmptyText(formData?.storyTitle)) {
    return createValidationError({
      message: 'La historia está activa. Escribe un título.',
      tab: 'content',
      field: 'storyTitle'
    });
  }

  if (!isNonEmptyText(formData?.storyText)) {
    return createValidationError({
      message:
        'La historia está activa. Escribe la historia de la pareja.',
      tab: 'content',
      field: 'storyText'
    });
  }

  return createValidResult();
}

export function validateDressCode(formData) {
  if (!formData?.sections?.dressCode) {
    return createValidResult();
  }

  if (!isNonEmptyText(formData?.dressCodeTitle)) {
    return createValidationError({
      message:
        'El código de vestimenta está activo. Escribe el tipo de vestimenta.',
      tab: 'content',
      field: 'dressCodeTitle'
    });
  }

  return createValidResult();
}

export function validateGiftInformation(formData) {
  if (!formData?.sections?.gifts) {
    return createValidResult();
  }

  if (!isNonEmptyText(formData?.giftMessage)) {
    return createValidationError({
      message:
        'La mesa de regalos está activa. Escribe un mensaje o desactiva esta sección.',
      tab: 'content',
      field: 'giftMessage'
    });
  }

  if (formData.clabe && !isValidClabe(formData.clabe)) {
    return createValidationError({
      message:
        'La CLABE debe contener exactamente 18 números.',
      tab: 'content',
      field: 'clabe'
    });
  }

  const hasBankData =
    isNonEmptyText(formData.bankName) ||
    isNonEmptyText(formData.accountHolder) ||
    isNonEmptyText(formData.accountNumber) ||
    isNonEmptyText(formData.clabe);

  if (
    hasBankData &&
    !isNonEmptyText(formData.accountHolder)
  ) {
    return createValidationError({
      message:
        'Escribe el nombre del titular de la cuenta.',
      tab: 'content',
      field: 'accountHolder'
    });
  }

  return createValidResult();
}

export function validateGuestBook(formData) {
  if (!formData?.sections?.guestBook) {
    return createValidResult();
  }

  if (!isNonEmptyText(formData?.guestBookTitle)) {
    return createValidationError({
      message:
        'El libro de firmas está activo. Escribe un título.',
      tab: 'content',
      field: 'guestBookTitle'
    });
  }

  return createValidResult();
}

export function validateItinerary(formData) {
  if (!formData?.sections?.itinerary) {
    return createValidResult();
  }

  if (!hasValidItineraryItem(formData.itinerary)) {
    return createValidationError({
      message:
        'Agrega al menos una actividad con hora y nombre, o desactiva el itinerario.',
      tab: 'itinerary',
      field: 'itinerary'
    });
  }

  const incompleteItem = formData.itinerary.find((item) => {
    const hasSomeInformation =
      isNonEmptyText(item?.time) ||
      isNonEmptyText(item?.title) ||
      isNonEmptyText(item?.description) ||
      isNonEmptyText(item?.location);

    const isIncomplete =
      !isNonEmptyText(item?.time) ||
      !isNonEmptyText(item?.title);

    return hasSomeInformation && isIncomplete;
  });

  if (incompleteItem) {
    return createValidationError({
      message:
        'Todas las actividades utilizadas deben tener hora y nombre.',
      tab: 'itinerary',
      field: 'itinerary'
    });
  }

  return createValidResult();
}

export function validateMedia(formData, media) {
  if (
    formData?.sections?.gallery &&
    !hasGalleryImages(media?.gallery)
  ) {
    return createValidationError({
      message:
        'La galería está activa. Agrega al menos una fotografía o desactiva esta sección.',
      tab: 'media',
      field: 'gallery'
    });
  }

  if (
    formData?.sections?.music &&
    !hasSelectedMedia(media?.backgroundMusic)
  ) {
    return createValidationError({
      message:
        'La música de fondo está activa. Selecciona una canción o desactiva esta sección.',
      tab: 'media',
      field: 'backgroundMusic'
    });
  }

  return createValidResult();
}

export function validateTheme(formData) {
  const theme = formData?.theme || {};

  const colorFields = [
    {
      key: 'primaryColor',
      label: 'principal'
    },
    {
      key: 'secondaryColor',
      label: 'secundario'
    },
    {
      key: 'backgroundColor',
      label: 'de fondo'
    },
    {
      key: 'textColor',
      label: 'del texto'
    }
  ];

  for (const colorField of colorFields) {
    if (!isValidHexColor(theme[colorField.key])) {
      return createValidationError({
        message: `El color ${colorField.label} debe tener un formato hexadecimal válido, por ejemplo #9b7b6b.`,
        tab: 'design',
        field: colorField.key
      });
    }
  }

  return createValidResult();
}

export function validateWeddingForm({
  formData,
  media
}) {
  if (!formData || typeof formData !== 'object') {
    return createValidationError({
      message:
        'No se encontró la información de la invitación.',
      tab: 'general'
    });
  }

  const validations = [
    () => validateGeneralInformation(formData),
    () => validateLocation(formData),
    () => validateParents(formData),
    () => validateStory(formData),
    () => validateDressCode(formData),
    () => validateGiftInformation(formData),
    () => validateGuestBook(formData),
    () => validateItinerary(formData),
    () => validateMedia(formData, media),
    () => validateTheme(formData)
  ];

  for (const runValidation of validations) {
    const result = runValidation();

    if (!result.valid) {
      return result;
    }
  }

  return createValidResult();
}

export function focusInvalidField(fieldName) {
  if (
    !fieldName ||
    typeof document === 'undefined'
  ) {
    return;
  }

  window.setTimeout(() => {
    const element =
      document.getElementById(fieldName) ||
      document.querySelector(
        `[name="${fieldName}"]`
      );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    if (typeof element.focus === 'function') {
      element.focus({
        preventScroll: true
      });
    }
  }, 100);
}