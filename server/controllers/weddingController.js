const Wedding = require('../models/Wedding');

// Función para obtener los datos de la boda pública a través de la URL (slug)
exports.getWeddingBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Buscamos en la base de datos la boda que coincida con el slug
        const wedding = await Wedding.findOne({ slug: slug });

        if (!wedding) {
            return res.status(404).json({ message: 'Invitación no encontrada' });
        }

        res.status(200).json(wedding);
    } catch (error) {
        console.error("Error al buscar la boda:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para crear una nueva boda (Esta la usarás desde tu panel de administrador)
exports.createWedding = async (req, res) => {
    try {
        const newWedding = new Wedding(req.body);
        const savedWedding = await newWedding.save();
        res.status(201).json(savedWedding);
    } catch (error) {
        console.error("Error al crear la boda:", error);
        res.status(400).json({ message: 'Error al crear la boda, verifica los datos', error: error.message });
    }
};