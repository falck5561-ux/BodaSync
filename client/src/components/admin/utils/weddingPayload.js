function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function cleanBoolean(value, defaultValue = true) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }

  if (value === 'false' || value === 0 || value === '0') {
    return false;
  }

  return defaultValue;
}

function cleanUrl(value) {
  const cleanValue = cleanText(value);

  if (!cleanValue) {
    return '';
  }

  if (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://')
  ) {
    return cleanValue;
  }

  return `https://${cleanValue}`;
}

function cleanMediaUrl(value) {
  return cleanText(value);
}

function cleanClabe(value) {
  return cleanText(value).replace(/\s/g, '');
}

function normalizeEventDate(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}

export function cleanSections(sections = {}) {
  return {
    countdown: cleanBoolean(sections.countdown),
    calendar: cleanBoolean(sections.calendar),
    parents: cleanBoolean(sections.parents),
    story: cleanBoolean(sections.story),
    gallery: cleanBoolean(sections.gallery),
    itinerary: cleanBoolean(sections.itinerary),
    location: cleanBoolean(sections.location),
    dressCode: cleanBoolean(sections.dressCode),
    gifts: cleanBoolean(sections.gifts),
    music: cleanBoolean(sections.music),
    guestBook: cleanBoolean(sections.guestBook)
  };
}

export function cleanTheme(theme = {}) {
  return {
    primaryColor: cleanText(theme.primaryColor) || '#9b7b6b',
    secondaryColor: cleanText(theme.secondaryColor) || '#d6b89c',
    backgroundColor: cleanText(theme.backgroundColor) || '#fffaf6',
    textColor: cleanText(theme.textColor) || '#2f2925'
  };
}

export function cleanItinerary(itinerary = []) {
  if (!Array.isArray(itinerary)) {
    return [];
  }

  return itinerary
    .filter((item) => {
      return Boolean(
        cleanText(item?.time) ||
          cleanText(item?.title) ||
          cleanText(item?.description) ||
          cleanText(item?.location)
      );
    })
    .slice(0, 30)
    .map((item, index) => ({
      order: index + 1,
      time: cleanText(item.time),
      title: cleanText(item.title),
      description: cleanText(item.description),
      location: cleanText(item.location)
    }));
}

export function cleanUploadedMedia(uploadedMedia = {}) {
  const gallery = Array.isArray(uploadedMedia.gallery)
    ? uploadedMedia.gallery
    : [];

  return {
    coverImage: cleanMediaUrl(uploadedMedia.coverImage),
    coupleImage: cleanMediaUrl(uploadedMedia.coupleImage),
    backgroundMusic: cleanMediaUrl(uploadedMedia.backgroundMusic),

    gallery: gallery
      .map((imageUrl) => cleanMediaUrl(imageUrl))
      .filter(Boolean)
      .slice(0, 8)
  };
}

export function createWeddingPayload({
  formData,
  uploadedMedia = {}
}) {
  if (!formData || typeof formData !== 'object') {
    throw new Error(
      'No se encontró la información del formulario.'
    );
  }

  return {
    groomName: cleanText(formData.groomName),
    brideName: cleanText(formData.brideName),

    eventDate: normalizeEventDate(formData.eventDate),

    welcomeMessage: cleanText(formData.welcomeMessage),

    location: {
      venueName: cleanText(formData.venueName),
      venueAddress: cleanText(formData.venueAddress),
      mapsUrl: cleanUrl(formData.mapsUrl)
    },

    parents: {
      groomFather: cleanText(formData.groomFather),
      groomMother: cleanText(formData.groomMother),
      brideFather: cleanText(formData.brideFather),
      brideMother: cleanText(formData.brideMother)
    },

    story: {
      title: cleanText(formData.storyTitle),
      text: cleanText(formData.storyText)
    },

    dressCode: {
      title: cleanText(formData.dressCodeTitle),
      women: cleanText(formData.dressCodeWomen),
      men: cleanText(formData.dressCodeMen),
      notes: cleanText(formData.dressCodeNotes)
    },

    gifts: {
      message: cleanText(formData.giftMessage),
      bankName: cleanText(formData.bankName),
      accountHolder: cleanText(formData.accountHolder),
      accountNumber: cleanText(formData.accountNumber),
      clabe: cleanClabe(formData.clabe)
    },

    guestBook: {
      title: cleanText(formData.guestBookTitle)
    },

    sections: cleanSections(formData.sections),

    itinerary: cleanItinerary(formData.itinerary),

    theme: cleanTheme(formData.theme),

    media: cleanUploadedMedia(uploadedMedia),

    status: 'published'
  };
}