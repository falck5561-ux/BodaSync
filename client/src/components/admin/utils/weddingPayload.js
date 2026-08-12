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

  if (
    value === 'true' ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === 'false' ||
    value === 0 ||
    value === '0'
  ) {
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
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return cleanText(value);
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    return cleanText(
      value.url ||
        value.secureUrl ||
        value.secure_url ||
        value.fileUrl ||
        value.path ||
        value.src ||
        ''
    );
  }

  return '';
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

function normalizeThemeMode(value) {
  return value === 'dark'
    ? 'dark'
    : 'light';
}

/*
 * =========================================================
 * SECCIONES
 * =========================================================
 */

export function cleanSections(
  sections = {}
) {
  return {
    countdown: cleanBoolean(
      sections.countdown
    ),

    calendar: cleanBoolean(
      sections.calendar
    ),

    parents: cleanBoolean(
      sections.parents
    ),

    story: cleanBoolean(
      sections.story
    ),

    gallery: cleanBoolean(
      sections.gallery
    ),

    itinerary: cleanBoolean(
      sections.itinerary
    ),

    location: cleanBoolean(
      sections.location
    ),

    dressCode: cleanBoolean(
      sections.dressCode
    ),

    gifts: cleanBoolean(
      sections.gifts
    ),

    music: cleanBoolean(
      sections.music
    ),

    guestBook: cleanBoolean(
      sections.guestBook
    )
  };
}

/*
 * =========================================================
 * TEMA
 * =========================================================
 *
 * IMPORTANTE:
 *
 * Antes solamente enviábamos los colores.
 *
 * Eso eliminaba:
 *
 * theme.mode
 * theme.allowThemeToggle
 *
 * Ahora los conservamos.
 */

export function cleanTheme(
  theme = {}
) {
  return {
    primaryColor:
      cleanText(
        theme.primaryColor
      ) || '#9b7b6b',

    secondaryColor:
      cleanText(
        theme.secondaryColor
      ) || '#d6b89c',

    backgroundColor:
      cleanText(
        theme.backgroundColor
      ) || '#fffaf6',

    textColor:
      cleanText(
        theme.textColor
      ) || '#2f2925',

    mode:
      normalizeThemeMode(
        theme.mode
      ),

    allowThemeToggle:
      cleanBoolean(
        theme.allowThemeToggle,
        true
      )
  };
}

/*
 * =========================================================
 * ITINERARIO
 * =========================================================
 */

export function cleanItinerary(
  itinerary = []
) {
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

      time:
        cleanText(item.time),

      title:
        cleanText(item.title),

      description:
        cleanText(
          item.description
        ),

      location:
        cleanText(item.location)
    }));
}

/*
 * =========================================================
 * MULTIMEDIA
 * =========================================================
 *
 * Estructura final:
 *
 * media: {
 *   coverImage,
 *   coupleImage,
 *   musicUrl,
 *   backgroundMusic,
 *   gallery
 * }
 *
 * Guardamos musicUrl como nombre principal.
 *
 * backgroundMusic queda también disponible por
 * compatibilidad con versiones anteriores del cliente.
 */

export function cleanUploadedMedia(
  uploadedMedia = {}
) {
  const gallerySource =
    Array.isArray(
      uploadedMedia.gallery
    )
      ? uploadedMedia.gallery
      : Array.isArray(
            uploadedMedia.photos
          )
        ? uploadedMedia.photos
        : [];

  const coverImage =
    cleanMediaUrl(
      uploadedMedia.coverImage ||
        uploadedMedia.heroImage ||
        uploadedMedia.cover
    );

  const coupleImage =
    cleanMediaUrl(
      uploadedMedia.coupleImage ||
        uploadedMedia.storyImage ||
        uploadedMedia.couple
    );

  const musicUrl =
    cleanMediaUrl(
      uploadedMedia.musicUrl ||
        uploadedMedia.backgroundMusic ||
        uploadedMedia.music
    );

  const gallery =
    gallerySource
      .map((image) =>
        cleanMediaUrl(image)
      )
      .filter(Boolean)
      .slice(0, 8);

  return {
    coverImage,

    coupleImage,

    /*
     * Nombre que espera la estructura
     * actual de la boda pública.
     */
    musicUrl,

    /*
     * Alias compatible con el código
     * anterior.
     */
    backgroundMusic:
      musicUrl,

    gallery
  };
}

/*
 * =========================================================
 * CREAR PAYLOAD DE INVITACIÓN
 * =========================================================
 */

export function createWeddingPayload({
  formData,
  uploadedMedia = {}
}) {
  if (
    !formData ||
    typeof formData !== 'object'
  ) {
    throw new Error(
      'No se encontró la información del formulario.'
    );
  }

  const cleanedMedia =
    cleanUploadedMedia(
      uploadedMedia
    );

  return {
    /*
     * =====================================================
     * INFORMACIÓN PRINCIPAL
     * =====================================================
     */

    groomName:
      cleanText(
        formData.groomName
      ),

    brideName:
      cleanText(
        formData.brideName
      ),

    eventDate:
      normalizeEventDate(
        formData.eventDate
      ),

    welcomeMessage:
      cleanText(
        formData.welcomeMessage
      ),

    /*
     * =====================================================
     * UBICACIÓN
     * =====================================================
     */

    location: {
      venueName:
        cleanText(
          formData.venueName
        ),

      venueAddress:
        cleanText(
          formData.venueAddress
        ),

      mapsUrl:
        cleanUrl(
          formData.mapsUrl
        )
    },

    /*
     * =====================================================
     * PADRES
     * =====================================================
     */

    parents: {
      groomFather:
        cleanText(
          formData.groomFather
        ),

      groomMother:
        cleanText(
          formData.groomMother
        ),

      brideFather:
        cleanText(
          formData.brideFather
        ),

      brideMother:
        cleanText(
          formData.brideMother
        )
    },

    /*
     * =====================================================
     * HISTORIA
     * =====================================================
     */

    story: {
      title:
        cleanText(
          formData.storyTitle
        ),

      text:
        cleanText(
          formData.storyText
        )
    },

    /*
     * =====================================================
     * CÓDIGO DE VESTIMENTA
     * =====================================================
     */

    dressCode: {
      title:
        cleanText(
          formData.dressCodeTitle
        ),

      women:
        cleanText(
          formData.dressCodeWomen
        ),

      men:
        cleanText(
          formData.dressCodeMen
        ),

      notes:
        cleanText(
          formData.dressCodeNotes
        )
    },

    /*
     * =====================================================
     * REGALOS
     * =====================================================
     */

    gifts: {
      message:
        cleanText(
          formData.giftMessage
        ),

      bankName:
        cleanText(
          formData.bankName
        ),

      accountHolder:
        cleanText(
          formData.accountHolder
        ),

      accountNumber:
        cleanText(
          formData.accountNumber
        ),

      clabe:
        cleanClabe(
          formData.clabe
        )
    },

    /*
     * =====================================================
     * LIBRO DE FIRMAS
     * =====================================================
     */

    guestBook: {
      title:
        cleanText(
          formData.guestBookTitle
        )
    },

    /*
     * =====================================================
     * SECCIONES
     * =====================================================
     */

    sections:
      cleanSections(
        formData.sections
      ),

    /*
     * =====================================================
     * ITINERARIO
     * =====================================================
     */

    itinerary:
      cleanItinerary(
        formData.itinerary
      ),

    /*
     * =====================================================
     * TEMA
     * =====================================================
     */

    theme:
      cleanTheme(
        formData.theme
      ),

    /*
     * =====================================================
     * MULTIMEDIA
     * =====================================================
     *
     * Este es el objeto que debe terminar guardado
     * en MongoDB.
     */

    media: {
      coverImage:
        cleanedMedia.coverImage,

      coupleImage:
        cleanedMedia.coupleImage,

      musicUrl:
        cleanedMedia.musicUrl,

      backgroundMusic:
        cleanedMedia.backgroundMusic,

      gallery:
        cleanedMedia.gallery
    },

    /*
     * =====================================================
     * ESTADO
     * =====================================================
     */

    status: 'published'
  };
}