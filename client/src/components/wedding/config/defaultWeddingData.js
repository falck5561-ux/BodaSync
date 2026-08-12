export const DEFAULT_WEDDING_SECTIONS = {
  countdown: false,
  calendar: false,
  parents: false,
  story: false,
  gallery: false,
  itinerary: false,
  location: false,
  dressCode: false,
  gifts: false,
  music: false,
  guestBook: false
};

export const DEFAULT_WEDDING_ASSETS = {
  musicUrl: '',
  paperSoundUrl: '',
  coverImage: null,
  coupleImage: null,
  gallery: []
};

export const DEFAULT_ITINERARY = [];

export const DEFAULT_WEDDING_THEME = {
  mode: 'light',
  allowThemeToggle: true,
  primaryColor: '#9b7b6b',
  secondaryColor: '#d6b89c',
  backgroundColor: '#fffaf6',
  textColor: '#2f2925'
};

export const DEFAULT_WEDDING_DATA = {
  id: '',
  slug: '',

  groomName: '',
  brideName: '',
  initials: '',

  eventDate: '',
  locationLabel: '',

  welcomeMessage: '',
  mainMessage: '',

  story: {
    title: '',
    text: ''
  },

  venue: {
    name: '',
    address: '',
    mapsUrl: ''
  },

  parents: {
    groom: {
      father: '',
      mother: ''
    },

    bride: {
      father: '',
      mother: ''
    }
  },

  media: {
    coverImage: null,
    coupleImage: null,
    gallery: [],
    musicUrl: '',
    paperSoundUrl: ''
  },

  itinerary: [],

  dressCode: {
    title: '',
    women: '',
    men: '',
    notes: ''
  },

  gifts: {
    message: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    clabe: ''
  },

  guestBook: {
    title: 'Libro de firmas',
    subtitle: ''
  },

  sections: {
    ...DEFAULT_WEDDING_SECTIONS
  },

  theme: {
    ...DEFAULT_WEDDING_THEME
  },

  status: 'published',

  createdAt: '',
  updatedAt: '',
  publicUrl: ''
};

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function createInitials(groomName, brideName) {
  const groomInitial = cleanText(groomName)
    .charAt(0)
    .toUpperCase();

  const brideInitial = cleanText(brideName)
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

export function createDefaultWeddingData(overrides = {}) {
  const defaults = cloneValue(DEFAULT_WEDDING_DATA);

  const groomName = cleanText(
    overrides.groomName ?? defaults.groomName
  );

  const brideName = cleanText(
    overrides.brideName ?? defaults.brideName
  );

  const media =
    overrides.media &&
    typeof overrides.media === 'object'
      ? overrides.media
      : {};

  const sections =
    overrides.sections &&
    typeof overrides.sections === 'object'
      ? overrides.sections
      : {};

  const theme =
    overrides.theme &&
    typeof overrides.theme === 'object'
      ? overrides.theme
      : {};

  return {
    ...defaults,
    ...overrides,

    groomName,
    brideName,

    initials:
      cleanText(overrides.initials) ||
      createInitials(groomName, brideName),

    story: {
      ...defaults.story,
      ...(overrides.story || {})
    },

    venue: {
      ...defaults.venue,
      ...(overrides.venue || {})
    },

    parents: {
      groom: {
        ...defaults.parents.groom,
        ...(overrides.parents?.groom || {})
      },

      bride: {
        ...defaults.parents.bride,
        ...(overrides.parents?.bride || {})
      }
    },

    media: {
      ...defaults.media,
      ...media,

      gallery: Array.isArray(media.gallery)
        ? media.gallery
        : []
    },

    itinerary: Array.isArray(overrides.itinerary)
      ? overrides.itinerary
      : [],

    dressCode: {
      ...defaults.dressCode,
      ...(overrides.dressCode || {})
    },

    gifts: {
      ...defaults.gifts,
      ...(overrides.gifts || {})
    },

    guestBook: {
      ...defaults.guestBook,
      ...(overrides.guestBook || {})
    },

    sections: {
      ...defaults.sections,
      ...sections
    },

    theme: {
      ...defaults.theme,
      ...theme
    }
  };
}

export default DEFAULT_WEDDING_DATA;