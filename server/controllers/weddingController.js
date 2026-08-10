const mongoose = require('mongoose');

const Wedding = require('../models/Wedding');

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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

function createSlug(text) {
  return cleanText(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(groomName, brideName, eventDate) {
  const date = new Date(eventDate);
  const year = date.getUTCFullYear();

  const namesSlug =
    createSlug(`${groomName}-y-${brideName}`) || 'boda';

  const baseSlug = `${namesSlug}-${year}`;

  let slug = baseSlug;
  let number = 2;

  while (await Wedding.exists({ slug })) {
    slug = `${baseSlug}-${number}`;
    number += 1;
  }

  return slug;
}

function normalizeLocation(body = {}) {
  const location = isObject(body.location) ? body.location : {};

  return {
    venueName: cleanText(
      location.venueName ||
        location.name ||
        body.venueName
    ),

    venueAddress: cleanText(
      location.venueAddress ||
        location.address ||
        body.venueAddress
    ),

    mapsUrl: cleanText(
      location.mapsUrl ||
        location.googleMapsUrl ||
        body.mapsUrl
    )
  };
}

function normalizeParents(body = {}) {
  const parents = isObject(body.parents) ? body.parents : {};

  return {
    groomFather: cleanText(
      parents.groomFather || body.groomFather
    ),

    groomMother: cleanText(
      parents.groomMother || body.groomMother
    ),

    brideFather: cleanText(
      parents.brideFather || body.brideFather
    ),

    brideMother: cleanText(
      parents.brideMother || body.brideMother
    )
  };
}

function normalizeStory(body = {}) {
  const story = isObject(body.story) ? body.story : {};

  return {
    title: cleanText(
      story.title || body.storyTitle
    ),

    text: cleanText(
      story.text || body.storyText
    )
  };
}

function normalizeDressCode(body = {}) {
  const dressCode = isObject(body.dressCode)
    ? body.dressCode
    : {};

  return {
    title: cleanText(
      dressCode.title || body.dressCodeTitle
    ),

    women: cleanText(
      dressCode.women || body.dressCodeWomen
    ),

    men: cleanText(
      dressCode.men || body.dressCodeMen
    ),

    notes: cleanText(
      dressCode.notes || body.dressCodeNotes
    )
  };
}

function normalizeGifts(body = {}) {
  const gifts = isObject(body.gifts) ? body.gifts : {};

  return {
    message: cleanText(
      gifts.message || body.giftMessage
    ),

    bankName: cleanText(
      gifts.bankName || body.bankName
    ),

    accountHolder: cleanText(
      gifts.accountHolder || body.accountHolder
    ),

    accountNumber: cleanText(
      gifts.accountNumber || body.accountNumber
    ),

    clabe: cleanText(
      gifts.clabe || body.clabe
    ).replace(/\s/g, '')
  };
}

function normalizeGuestBook(body = {}) {
  const guestBook = isObject(body.guestBook)
    ? body.guestBook
    : {};

  return {
    title: cleanText(
      guestBook.title || body.guestBookTitle
    )
  };
}

function normalizeSections(sections) {
  const source = isObject(sections)
    ? sections
    : {};

  return {
    countdown: cleanBoolean(
      source.countdown,
      true
    ),

    calendar: cleanBoolean(
      source.calendar,
      true
    ),

    parents: cleanBoolean(
      source.parents,
      true
    ),

    story: cleanBoolean(
      source.story,
      true
    ),

    gallery: cleanBoolean(
      source.gallery,
      true
    ),

    itinerary: cleanBoolean(
      source.itinerary,
      true
    ),

    location: cleanBoolean(
      source.location,
      true
    ),

    dressCode: cleanBoolean(
      source.dressCode,
      true
    ),

    gifts: cleanBoolean(
      source.gifts,
      true
    ),

    music: cleanBoolean(
      source.music,
      true
    ),

    guestBook: cleanBoolean(
      source.guestBook,
      true
    )
  };
}

function normalizeItinerary(itinerary) {
  if (!Array.isArray(itinerary)) {
    return [];
  }

  return itinerary
    .slice(0, 30)
    .map((item, index) => {
      const source = isObject(item)
        ? item
        : {};

      return {
        order: index + 1,

        time: cleanText(
          source.time
        ),

        title: cleanText(
          source.title
        ),

        description: cleanText(
          source.description
        ),

        location: cleanText(
          source.location
        )
      };
    })
    .filter((item) => {
      return Boolean(
        item.time ||
          item.title ||
          item.description ||
          item.location
      );
    })
    .map((item, index) => ({
      ...item,
      order: index + 1
    }));
}

function normalizeTheme(theme) {
  const source = isObject(theme)
    ? theme
    : {};

  return {
    primaryColor:
      cleanText(source.primaryColor) ||
      '#9b7b6b',

    secondaryColor:
      cleanText(source.secondaryColor) ||
      '#d6b89c',

    backgroundColor:
      cleanText(source.backgroundColor) ||
      '#fffaf6',

    textColor:
      cleanText(source.textColor) ||
      '#2f2925',

    mode:
      source.mode === 'dark'
        ? 'dark'
        : 'light',

    allowThemeToggle: cleanBoolean(
      source.allowThemeToggle,
      true
    )
  };
}

function getMediaUrl(value) {
  if (typeof value === 'string') {
    return cleanText(value);
  }

  if (!isObject(value)) {
    return '';
  }

  return cleanText(
    value.url ||
      value.secureUrl ||
      value.secure_url ||
      value.fileUrl ||
      value.path ||
      value.src
  );
}

function normalizeMedia(media) {
  const source = isObject(media)
    ? media
    : {};

  const gallerySource = Array.isArray(
    source.gallery
  )
    ? source.gallery
    : Array.isArray(source.galleryUrls)
      ? source.galleryUrls
      : Array.isArray(source.galleryFileNames)
        ? source.galleryFileNames
        : Array.isArray(source.photos)
          ? source.photos
          : [];

  const coverImage = getMediaUrl(
    source.coverImage ||
      source.coverImageUrl ||
      source.coverImageName ||
      source.heroImage ||
      source.cover
  );

  const coupleImage = getMediaUrl(
    source.coupleImage ||
      source.coupleImageUrl ||
      source.coupleImageName ||
      source.storyImage ||
      source.couple
  );

  const musicUrl = getMediaUrl(
    source.musicUrl ||
      source.backgroundMusic ||
      source.musicFileName ||
      source.music
  );

  const gallery = gallerySource
    .map((item) => getMediaUrl(item))
    .filter(Boolean)
    .slice(0, 8);

  return {
    coverImage,
    coupleImage,

    /*
     * Campo actual utilizado por la invitación.
     */
    musicUrl,

    /*
     * Compatibilidad con versiones anteriores
     * del administrador y de LandingPage.
     */
    backgroundMusic: musicUrl,

    gallery
  };
}

function normalizeStatus(status) {
  return status === 'draft'
    ? 'draft'
    : 'published';
}

function buildWeddingData(
  body,
  parsedDate,
  slug
) {
  return {
    slug,

    groomName: cleanText(
      body.groomName
    ),

    brideName: cleanText(
      body.brideName
    ),

    eventDate: parsedDate,

    welcomeMessage: cleanText(
      body.welcomeMessage
    ),

    location: normalizeLocation(body),

    parents: normalizeParents(body),

    story: normalizeStory(body),

    dressCode: normalizeDressCode(body),

    gifts: normalizeGifts(body),

    guestBook: normalizeGuestBook(body),

    sections: normalizeSections(
      body.sections
    ),

    itinerary: normalizeItinerary(
      body.itinerary
    ),

    theme: normalizeTheme(
      body.theme
    ),

    media: normalizeMedia(
      body.media
    ),

    status: normalizeStatus(
      body.status
    )
  };
}

function sendDatabaseError(
  res,
  error,
  fallbackMessage
) {
  if (error?.name === 'ValidationError') {
    const firstError = Object.values(
      error.errors || {}
    )[0];

    return res.status(400).json({
      message:
        firstError?.message ||
        'Los datos enviados no son válidos.'
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message:
        'Ya existe una invitación con esos datos. Intenta nuevamente.'
    });
  }

  return res.status(500).json({
    message: fallbackMessage
  });
}

exports.createWedding = async (
  req,
  res
) => {
  try {
    const body = isObject(req.body)
      ? req.body
      : {};

    const groomName = cleanText(
      body.groomName
    );

    const brideName = cleanText(
      body.brideName
    );

    const eventDate = cleanText(
      body.eventDate
    );

    const welcomeMessage = cleanText(
      body.welcomeMessage
    );

    if (
      !groomName ||
      !brideName ||
      !eventDate ||
      !welcomeMessage
    ) {
      return res.status(400).json({
        message:
          'Completa los nombres de los novios, la fecha y el mensaje de bienvenida.'
      });
    }

    const parsedDate = new Date(
      eventDate
    );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          'La fecha del evento no es válida.'
      });
    }

    const slug =
      await generateUniqueSlug(
        groomName,
        brideName,
        parsedDate
      );

    const weddingData =
      buildWeddingData(
        body,
        parsedDate,
        slug
      );

    const wedding =
      await Wedding.create(
        weddingData
      );

    return res
      .status(201)
      .json(wedding);
  } catch (error) {
    console.error(
      'Error al crear boda:',
      error
    );

    return sendDatabaseError(
      res,
      error,
      'No fue posible guardar el evento.'
    );
  }
};

exports.getWeddings = async (
  _req,
  res
) => {
  try {
    const weddings =
      await Wedding.find()
        .sort({
          createdAt: -1
        })
        .lean();

    return res
      .status(200)
      .json(weddings);
  } catch (error) {
    console.error(
      'Error al consultar bodas:',
      error
    );

    return sendDatabaseError(
      res,
      error,
      'No fue posible consultar los eventos.'
    );
  }
};

exports.getWeddingBySlug = async (
  req,
  res
) => {
  try {
    const slug = cleanText(
      req.params.slug
    ).toLowerCase();

    if (!slug) {
      return res.status(400).json({
        message:
          'La invitación solicitada no es válida.'
      });
    }

    const wedding =
      await Wedding.findOne({
        slug
      }).lean();

    if (!wedding) {
      return res.status(404).json({
        message:
          'La invitación no existe.'
      });
    }

    return res
      .status(200)
      .json(wedding);
  } catch (error) {
    console.error(
      'Error al consultar invitación:',
      error
    );

    return sendDatabaseError(
      res,
      error,
      'No fue posible cargar la invitación.'
    );
  }
};

exports.deleteWedding = async (
  req,
  res
) => {
  try {
    const weddingId = cleanText(
      req.params.id
    );

    if (
      !mongoose.isValidObjectId(
        weddingId
      )
    ) {
      return res.status(400).json({
        message:
          'El identificador del evento no es válido.'
      });
    }

    const wedding =
      await Wedding.findByIdAndDelete(
        weddingId
      );

    if (!wedding) {
      return res.status(404).json({
        message:
          'El evento no existe.'
      });
    }

    return res.status(200).json({
      message:
        'Evento eliminado correctamente.'
    });
  } catch (error) {
    console.error(
      'Error al eliminar evento:',
      error
    );

    return sendDatabaseError(
      res,
      error,
      'No fue posible eliminar el evento.'
    );
  }
};