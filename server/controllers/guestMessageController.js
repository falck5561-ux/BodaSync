const GuestMessage = require('../models/GuestMessage');
const Wedding = require('../models/Wedding');

function cleanText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeMessage(document) {
  if (!document) {
    return null;
  }

  return {
    _id: document._id,
    id: document._id,
    wedding: document.wedding,
    author: document.author,
    message: document.message,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
  };
}

async function findWeddingBySlug(slug) {
  const normalizedSlug = cleanText(slug);

  if (!normalizedSlug) {
    return null;
  }

  return Wedding.findOne({
    slug: normalizedSlug
  }).select('_id slug status sections guestBook');
}

async function getGuestMessages(req, res, next) {
  try {
    const slug = cleanText(req.params.slug);

    if (!slug) {
      return res.status(400).json({
        message: 'Falta el identificador de la invitación.'
      });
    }

    const wedding = await findWeddingBySlug(slug);

    if (!wedding) {
      return res.status(404).json({
        message: 'Invitación no encontrada.'
      });
    }

    const messages = await GuestMessage.find({
      wedding: wedding._id
    })
      .sort({
        createdAt: -1
      })
      .lean();

    return res.status(200).json(
      messages.map(normalizeMessage)
    );
  } catch (error) {
    return next(error);
  }
}

async function createGuestMessage(req, res, next) {
  try {
    const slug = cleanText(req.params.slug);

    if (!slug) {
      return res.status(400).json({
        message: 'Falta el identificador de la invitación.'
      });
    }

    const wedding = await findWeddingBySlug(slug);

    if (!wedding) {
      return res.status(404).json({
        message: 'Invitación no encontrada.'
      });
    }

    /*
     * Aceptamos varios nombres temporalmente
     * para que sea compatible con el frontend
     * que hemos ido migrando.
     */
    const author = cleanText(
      req.body?.author ||
        req.body?.name ||
        req.body?.nombre ||
        req.body?.family ||
        req.body?.familia
    );

    const message = cleanText(
      req.body?.message ||
        req.body?.content ||
        req.body?.mensaje
    );

    if (!message) {
      return res.status(400).json({
        message: 'Escribe un mensaje para los novios.'
      });
    }

    if (message.length < 2) {
      return res.status(400).json({
        message: 'El mensaje es demasiado corto.'
      });
    }

    if (message.length > 1200) {
      return res.status(400).json({
        message: 'El mensaje no puede superar los 1200 caracteres.'
      });
    }

    if (!author) {
      return res.status(400).json({
        message: 'Escribe tu nombre o el nombre de tu familia.'
      });
    }

    if (author.length < 2) {
      return res.status(400).json({
        message: 'El nombre es demasiado corto.'
      });
    }

    if (author.length > 120) {
      return res.status(400).json({
        message: 'El nombre no puede superar los 120 caracteres.'
      });
    }

    const createdMessage = await GuestMessage.create({
      wedding: wedding._id,
      author,
      message
    });

    return res.status(201).json(
      normalizeMessage(createdMessage)
    );
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Revisa la información del mensaje.'
      });
    }

    return next(error);
  }
}

module.exports = {
  getGuestMessages,
  createGuestMessage
};