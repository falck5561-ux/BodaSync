import {
  DEFAULT_WEDDING_SECTIONS,
  DEFAULT_WEDDING_THEME
} from '../config/defaultWeddingData';

import {
  formatWeddingDateHero,
  formatWeddingDateShort
} from './dateUtils';

const PUBLIC_SECTION_KEYS = [
  'countdown',
  'calendar',
  'parents',
  'story',
  'gallery',
  'itinerary',
  'location',
  'dressCode',
  'gifts',
  'music',
  'guestBook'
];

function cleanString(value, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim();

  return normalizedValue || fallback;
}

function firstString(...values) {
  for (const value of values) {
    const normalizedValue = cleanString(value);

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return '';
}

function getNestedValue(object, path, fallback = undefined) {
  if (!object || typeof object !== 'object') {
    return fallback;
  }

  const value = path.split('.').reduce((currentValue, key) => {
    if (currentValue === null || currentValue === undefined) {
      return undefined;
    }

    return currentValue[key];
  }, object);

  return value === undefined ? fallback : value;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return fallback;
}

function normalizeMediaUrl(value) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  return firstString(
    value.url,
    value.secureUrl,
    value.secure_url,
    value.previewUrl,
    value.imageUrl,
    value.audioUrl,
    value.fileUrl,
    value.path
  );
}

function normalizeGallery(galleryValue) {
  if (!Array.isArray(galleryValue)) {
    return [];
  }

  return galleryValue
    .map((item, index) => {
      const url = normalizeMediaUrl(item);

      if (!url) {
        return null;
      }

      if (typeof item === 'string') {
        return {
          id: `gallery-${index + 1}`,
          url,
          alt: `Fotografía ${index + 1}`
        };
      }

      return {
        id: item.id || item._id || `gallery-${index + 1}`,
        url,
        alt:
          firstString(
            item.alt,
            item.title,
            item.name,
            item.description
          ) || `Fotografía ${index + 1}`
      };
    })
    .filter(Boolean);
}

function normalizeItinerary(itineraryValue) {
  if (!Array.isArray(itineraryValue)) {
    return [];
  }

  return itineraryValue
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const title = firstString(item.title, item.name, item.activity);
      const time = firstString(item.time, item.hour);
      const description = firstString(
        item.description,
        item.details,
        item.desc
      );
      const location = firstString(item.location, item.place);

      if (!title && !time && !description && !location) {
        return null;
      }

      return {
        id: item.id || item._id || `itinerary-${index + 1}`,
        order: Number.isFinite(Number(item.order))
          ? Number(item.order)
          : index + 1,
        time,
        subtitle: firstString(item.subtitle, item.label),
        title,
        icon: firstString(item.icon),
        description,
        location
      };
    })
    .filter(Boolean)
    .sort((firstItem, secondItem) => firstItem.order - secondItem.order);
}

function normalizeSections(sectionValue = {}, rawWedding = {}) {
  const source =
    sectionValue && typeof sectionValue === 'object'
      ? sectionValue
      : {};

  return PUBLIC_SECTION_KEYS.reduce((sections, sectionKey) => {
    const capitalizedKey =
      sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);

    const configuredValue =
      source[sectionKey] ??
      rawWedding[`show${capitalizedKey}`] ??
      rawWedding[`${sectionKey}Enabled`];

    const fallback =
      typeof DEFAULT_WEDDING_SECTIONS?.[sectionKey] === 'boolean'
        ? DEFAULT_WEDDING_SECTIONS[sectionKey]
        : true;

    sections[sectionKey] = normalizeBoolean(configuredValue, fallback);

    return sections;
  }, {});
}

function normalizeTheme(themeValue = {}) {
  const source =
    themeValue && typeof themeValue === 'object' ? themeValue : {};

  return {
    mode: source.mode === 'dark' ? 'dark' : 'light',

    allowThemeToggle: normalizeBoolean(
      source.allowThemeToggle,
      DEFAULT_WEDDING_THEME.allowThemeToggle
    ),

    primaryColor: cleanString(
      source.primaryColor,
      DEFAULT_WEDDING_THEME.primaryColor
    ),

    secondaryColor: cleanString(
      source.secondaryColor,
      DEFAULT_WEDDING_THEME.secondaryColor
    ),

    backgroundColor: cleanString(
      source.backgroundColor,
      DEFAULT_WEDDING_THEME.backgroundColor
    ),

    textColor: cleanString(
      source.textColor,
      DEFAULT_WEDDING_THEME.textColor
    )
  };
}

function createInitials(groomName, brideName) {
  const groomInitial = cleanString(groomName)
    .charAt(0)
    .toUpperCase();

  const brideInitial = cleanString(brideName)
    .charAt(0)
    .toUpperCase();

  if (!groomInitial && !brideInitial) {
    return '';
  }

  if (!groomInitial) {
    return brideInitial;
  }

  if (!brideInitial) {
    return groomInitial;
  }

  return `${groomInitial}&${brideInitial}`;
}

function normalizeVenue(rawWedding) {
  return {
    name: firstString(
      getNestedValue(rawWedding, 'location.venueName'),
      getNestedValue(rawWedding, 'venue.name'),
      getNestedValue(rawWedding, 'location.name'),
      rawWedding.venueName,
      rawWedding.placeName
    ),

    address: firstString(
      getNestedValue(rawWedding, 'location.venueAddress'),
      getNestedValue(rawWedding, 'venue.address'),
      getNestedValue(rawWedding, 'location.address'),
      rawWedding.venueAddress,
      rawWedding.address,
      rawWedding.lugar
    ),

    mapsUrl: firstString(
      getNestedValue(rawWedding, 'location.mapsUrl'),
      getNestedValue(rawWedding, 'location.googleMapsUrl'),
      getNestedValue(rawWedding, 'venue.mapsUrl'),
      getNestedValue(rawWedding, 'venue.googleMapsUrl'),
      rawWedding.mapsUrl,
      rawWedding.googleMapsUrl,
      rawWedding.mapUrl
    )
  };
}

function normalizeParents(rawWedding) {
  const groomParents = Array.isArray(rawWedding.padresNovio)
    ? rawWedding.padresNovio
    : [];

  const brideParents = Array.isArray(rawWedding.padresNovia)
    ? rawWedding.padresNovia
    : [];

  return {
    groom: {
      father: firstString(
        getNestedValue(rawWedding, 'parents.groomFather'),
        getNestedValue(rawWedding, 'parents.groom.father'),
        rawWedding.groomFather,
        groomParents[0]
      ),

      mother: firstString(
        getNestedValue(rawWedding, 'parents.groomMother'),
        getNestedValue(rawWedding, 'parents.groom.mother'),
        rawWedding.groomMother,
        groomParents[1]
      )
    },

    bride: {
      father: firstString(
        getNestedValue(rawWedding, 'parents.brideFather'),
        getNestedValue(rawWedding, 'parents.bride.father'),
        rawWedding.brideFather,
        brideParents[0]
      ),

      mother: firstString(
        getNestedValue(rawWedding, 'parents.brideMother'),
        getNestedValue(rawWedding, 'parents.bride.mother'),
        rawWedding.brideMother,
        brideParents[1]
      )
    }
  };
}

function normalizeStory(rawWedding) {
  return {
    title: firstString(
      getNestedValue(rawWedding, 'story.title'),
      rawWedding.storyTitle
    ),

    text: firstString(
      getNestedValue(rawWedding, 'story.text'),
      rawWedding.storyText,
      rawWedding.storyDescription
    )
  };
}

function normalizeDressCode(rawWedding) {
  return {
    title: firstString(
      getNestedValue(rawWedding, 'dressCode.title'),
      rawWedding.dressCodeTitle
    ),

    women: firstString(
      getNestedValue(rawWedding, 'dressCode.women'),
      rawWedding.dressCodeWomen
    ),

    men: firstString(
      getNestedValue(rawWedding, 'dressCode.men'),
      rawWedding.dressCodeMen
    ),

    notes: firstString(
      getNestedValue(rawWedding, 'dressCode.notes'),
      rawWedding.dressCodeNotes
    )
  };
}

function normalizeGifts(rawWedding) {
  return {
    message: firstString(
      getNestedValue(rawWedding, 'gifts.message'),
      rawWedding.giftMessage
    ),

    bankName: firstString(
      getNestedValue(rawWedding, 'gifts.bankName'),
      rawWedding.bankName
    ),

    accountHolder: firstString(
      getNestedValue(rawWedding, 'gifts.accountHolder'),
      rawWedding.accountHolder
    ),

    accountNumber: firstString(
      getNestedValue(rawWedding, 'gifts.accountNumber'),
      rawWedding.accountNumber
    ),

    clabe: firstString(
      getNestedValue(rawWedding, 'gifts.clabe'),
      rawWedding.clabe
    )
  };
}

function normalizeGuestBook(rawWedding) {
  return {
    title:
      firstString(
        getNestedValue(rawWedding, 'guestBook.title'),
        rawWedding.guestBookTitle
      ) || 'Libro de firmas',

    subtitle: firstString(
      getNestedValue(rawWedding, 'guestBook.subtitle'),
      rawWedding.guestBookSubtitle
    )
  };
}

function normalizeMedia(rawWedding) {
  const gallerySource =
    getNestedValue(rawWedding, 'media.gallery') ||
    rawWedding.gallery ||
    rawWedding.photos ||
    [];

  return {
    coverImage: normalizeMediaUrl(
      getNestedValue(rawWedding, 'media.coverImage') ||
        rawWedding.coverImage ||
        rawWedding.heroImage
    ),

    coupleImage: normalizeMediaUrl(
      getNestedValue(rawWedding, 'media.coupleImage') ||
        rawWedding.coupleImage
    ),

    gallery: normalizeGallery(gallerySource),

    musicUrl: normalizeMediaUrl(
      getNestedValue(rawWedding, 'media.backgroundMusic') ||
        getNestedValue(rawWedding, 'media.musicUrl') ||
        rawWedding.backgroundMusic ||
        rawWedding.musicUrl
    ),

    paperSoundUrl: normalizeMediaUrl(
      getNestedValue(rawWedding, 'media.paperSoundUrl') ||
        rawWedding.paperSoundUrl
    )
  };
}

export function unwrapWeddingResponse(response) {
  if (!response || typeof response !== 'object') {
    return {};
  }

  if (response.wedding && typeof response.wedding === 'object') {
    return response.wedding;
  }

  if (
    response.data?.wedding &&
    typeof response.data.wedding === 'object'
  ) {
    return response.data.wedding;
  }

  if (response.data && typeof response.data === 'object') {
    return response.data;
  }

  return response;
}

export function mapWeddingData(response, slugFallback = '') {
  const rawWedding = unwrapWeddingResponse(response);

  const groomName = firstString(
    rawWedding.groomName,
    rawWedding.novio,
    getNestedValue(rawWedding, 'groom.name')
  );

  const brideName = firstString(
    rawWedding.brideName,
    rawWedding.novia,
    getNestedValue(rawWedding, 'bride.name')
  );

  const eventDate = firstString(
    rawWedding.eventDate,
    rawWedding.fecha,
    rawWedding.date
  );

  const venue = normalizeVenue(rawWedding);
  const parents = normalizeParents(rawWedding);
  const story = normalizeStory(rawWedding);
  const dressCode = normalizeDressCode(rawWedding);
  const gifts = normalizeGifts(rawWedding);
  const guestBook = normalizeGuestBook(rawWedding);
  const media = normalizeMedia(rawWedding);

  const locationLabel = firstString(
    rawWedding.locationLabel,
    venue.address,
    venue.name,
    rawWedding.lugar
  );

  const welcomeMessage = firstString(
    rawWedding.welcomeMessage,
    rawWedding.message
  );

  const mainMessage = firstString(
    rawWedding.mainMessage,
    rawWedding.mensajePrincipal,
    story.text,
    welcomeMessage
  );

  const initials =
    firstString(rawWedding.initials, rawWedding.iniciales) ||
    createInitials(groomName, brideName);

  const itinerarySource =
    rawWedding.itinerary ||
    rawWedding.schedule ||
    rawWedding.program ||
    [];

  const normalizedWedding = {
    id: rawWedding.id || rawWedding._id || '',

    slug: firstString(rawWedding.slug, slugFallback),

    groomName,
    brideName,
    initials,

    eventDate,
    locationLabel,

    welcomeMessage,
    mainMessage,

    story,
    venue,
    parents,
    media,

    itinerary: normalizeItinerary(itinerarySource),

    dressCode,
    gifts,
    guestBook,

    sections: normalizeSections(rawWedding.sections, rawWedding),

    theme: normalizeTheme(rawWedding.theme),

    status: firstString(rawWedding.status, 'published'),

    createdAt: rawWedding.createdAt || '',
    updatedAt: rawWedding.updatedAt || '',
    publicUrl: firstString(rawWedding.publicUrl)
  };

  return {
    ...normalizedWedding,

    fechaHero: eventDate ? formatWeddingDateHero(eventDate) : '',
    fechaCorta: eventDate ? formatWeddingDateShort(eventDate) : '',

    novio: groomName,
    novia: brideName,
    iniciales: initials,
    fecha: eventDate,
    lugar: locationLabel,
    mensajePrincipal: mainMessage,

    padresNovio: [
      parents.groom.father,
      parents.groom.mother
    ].filter(Boolean),

    padresNovia: [
      parents.bride.father,
      parents.bride.mother
    ].filter(Boolean)
  };
}

export function mapWeddingList(response) {
  const weddingList = Array.isArray(response)
    ? response
    : response?.weddings || response?.data || [];

  if (!Array.isArray(weddingList)) {
    return [];
  }

  return weddingList.map((wedding) => mapWeddingData(wedding));
}

export function isWeddingSectionEnabled(wedding, sectionName) {
  if (!sectionName) {
    return false;
  }

  return wedding?.sections?.[sectionName] === true;
}

export default mapWeddingData;