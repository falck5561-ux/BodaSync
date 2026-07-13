const Wedding = require('../models/Wedding');

function createSlug(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(groomName, brideName, eventDate) {
  const date = new Date(eventDate);
  const year = date.getUTCFullYear();

  const namesSlug = createSlug(`${groomName}-y-${brideName}`);
  const baseSlug = `${namesSlug}-${year}`;

  let slug = baseSlug;
  let number = 2;

  while (await Wedding.exists({ slug })) {
    slug = `${baseSlug}-${number}`;
    number += 1;
  }

  return slug;
}

exports.createWedding = async (req, res) => {
  try {
    const {
      groomName,
      brideName,
      eventDate,
      welcomeMessage,
      location
    } = req.body;

    if (!groomName || !brideName || !eventDate || !welcomeMessage) {
      return res.status(400).json({
        message: 'Completa todos los campos obligatorios.'
      });
    }

    const parsedDate = new Date(eventDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: 'La fecha del evento no es válida.'
      });
    }

    const slug = await generateUniqueSlug(
      groomName,
      brideName,
      eventDate
    );

    const wedding = await Wedding.create({
      slug,
      groomName,
      brideName,
      eventDate,
      welcomeMessage,
      location: location || {}
    });

    return res.status(201).json(wedding);
  } catch (error) {
    console.error('Error al crear boda:', error);

    return res.status(500).json({
      message: 'No fue posible guardar el evento.'
    });
  }
};

exports.getWeddings = async (req, res) => {
  try {
    const weddings = await Wedding.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(weddings);
  } catch (error) {
    console.error('Error al consultar bodas:', error);

    return res.status(500).json({
      message: 'No fue posible consultar los eventos.'
    });
  }
};

exports.getWeddingBySlug = async (req, res) => {
  try {
    const wedding = await Wedding.findOne({
      slug: req.params.slug
    }).lean();

    if (!wedding) {
      return res.status(404).json({
        message: 'La invitación no existe.'
      });
    }

    return res.status(200).json(wedding);
  } catch (error) {
    console.error('Error al consultar invitación:', error);

    return res.status(500).json({
      message: 'No fue posible cargar la invitación.'
    });
  }
};

exports.deleteWedding = async (req, res) => {
  try {
    const wedding = await Wedding.findByIdAndDelete(req.params.id);

    if (!wedding) {
      return res.status(404).json({
        message: 'El evento no existe.'
      });
    }

    return res.status(200).json({
      message: 'Evento eliminado correctamente.'
    });
  } catch (error) {
    console.error('Error al eliminar evento:', error);

    return res.status(500).json({
      message: 'No fue posible eliminar el evento.'
    });
  }
};