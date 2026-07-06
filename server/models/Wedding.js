const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema({
    // El identificador único para la URL (ej: 'manuel-y-luz-2026')
    slug: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    
    // Nombres principales
    groomName: { type: String, required: true },
    brideName: { type: String, required: true },
    
    // Fecha y Ubicación
    eventDate: { type: Date, required: true },
    location: {
        name: { type: String },
        address: { type: String },
        googleMapsUrl: { type: String }
    },

    // Configuración de Diseño (para que cada boda pueda ser clara u oscura)
    theme: {
        isDark: { type: Boolean, default: false },
        primaryColor: { type: String, default: '#C5A059' } 
    },

    // Información de los padres
    parents: {
        groomParents: { type: String },
        brideParents: { type: String }
    },

    // Itinerario Dinámico
    itinerary: [{
        time: { type: String }, // ej. "19:00 HRS"
        subtitle: { type: String }, // ej. "MOMENTO 1"
        title: { type: String }, // ej. "Recepción"
        description: { type: String },
        icon: { type: String } // ej. "🥂"
    }],

    dressCode: { type: String, default: 'Estricto Formal' },
    
    // Mensaje principal ("Te elijo a ti para caminar juntos...")
    heroQuote: { type: String } 

}, { timestamps: true });

module.exports = mongoose.model('Wedding', weddingSchema);