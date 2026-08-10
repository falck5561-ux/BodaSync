const mongoose = require('mongoose');

const { Schema } = mongoose;

const locationSchema = new Schema(
  {
    venueName: {
      type: String,
      trim: true,
      default: ''
    },

    venueAddress: {
      type: String,
      trim: true,
      default: ''
    },

    mapsUrl: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const parentsSchema = new Schema(
  {
    groomFather: {
      type: String,
      trim: true,
      default: ''
    },

    groomMother: {
      type: String,
      trim: true,
      default: ''
    },

    brideFather: {
      type: String,
      trim: true,
      default: ''
    },

    brideMother: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const storySchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: ''
    },

    text: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const dressCodeSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: ''
    },

    women: {
      type: String,
      trim: true,
      default: ''
    },

    men: {
      type: String,
      trim: true,
      default: ''
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const giftsSchema = new Schema(
  {
    message: {
      type: String,
      trim: true,
      default: ''
    },

    bankName: {
      type: String,
      trim: true,
      default: ''
    },

    accountHolder: {
      type: String,
      trim: true,
      default: ''
    },

    accountNumber: {
      type: String,
      trim: true,
      default: ''
    },

    clabe: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const guestBookSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const sectionsSchema = new Schema(
  {
    countdown: {
      type: Boolean,
      default: true
    },

    calendar: {
      type: Boolean,
      default: true
    },

    parents: {
      type: Boolean,
      default: true
    },

    story: {
      type: Boolean,
      default: true
    },

    gallery: {
      type: Boolean,
      default: true
    },

    itinerary: {
      type: Boolean,
      default: true
    },

    location: {
      type: Boolean,
      default: true
    },

    dressCode: {
      type: Boolean,
      default: true
    },

    gifts: {
      type: Boolean,
      default: true
    },

    music: {
      type: Boolean,
      default: true
    },

    guestBook: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: false
  }
);

const itineraryItemSchema = new Schema(
  {
    order: {
      type: Number,
      min: 1,
      default: 1
    },

    time: {
      type: String,
      trim: true,
      default: ''
    },

    title: {
      type: String,
      trim: true,
      default: ''
    },

    description: {
      type: String,
      trim: true,
      default: ''
    },

    location: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: false
  }
);

const themeSchema = new Schema(
  {
    primaryColor: {
      type: String,
      trim: true,
      default: '#9b7b6b'
    },

    secondaryColor: {
      type: String,
      trim: true,
      default: '#d6b89c'
    },

    backgroundColor: {
      type: String,
      trim: true,
      default: '#fffaf6'
    },

    textColor: {
      type: String,
      trim: true,
      default: '#2f2925'
    },

    /*
     * Tema inicial de la invitación.
     */
    mode: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },

    /*
     * Permite mostrar u ocultar el cambio de tema
     * dentro de la invitación pública.
     */
    allowThemeToggle: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: false
  }
);

const mediaSchema = new Schema(
  {
    coverImage: {
      type: String,
      trim: true,
      default: ''
    },

    coupleImage: {
      type: String,
      trim: true,
      default: ''
    },

    /*
     * Campo principal actual para la música.
     */
    musicUrl: {
      type: String,
      trim: true,
      default: ''
    },

    /*
     * Se conserva para compatibilidad con
     * invitaciones/código anteriores.
     */
    backgroundMusic: {
      type: String,
      trim: true,
      default: ''
    },

    gallery: {
      type: [
        {
          type: String,
          trim: true
        }
      ],

      default: [],

      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length <= 8
          );
        },

        message:
          'La galería admite un máximo de 8 imágenes.'
      }
    }
  },
  {
    _id: false
  }
);

const weddingSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    groomName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    brideName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    eventDate: {
      type: Date,
      required: true
    },

    welcomeMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },

    location: {
      type: locationSchema,
      default: () => ({})
    },

    parents: {
      type: parentsSchema,
      default: () => ({})
    },

    story: {
      type: storySchema,
      default: () => ({})
    },

    dressCode: {
      type: dressCodeSchema,
      default: () => ({})
    },

    gifts: {
      type: giftsSchema,
      default: () => ({})
    },

    guestBook: {
      type: guestBookSchema,
      default: () => ({})
    },

    sections: {
      type: sectionsSchema,
      default: () => ({})
    },

    itinerary: {
      type: [itineraryItemSchema],
      default: []
    },

    theme: {
      type: themeSchema,
      default: () => ({})
    },

    media: {
      type: mediaSchema,
      default: () => ({})
    },

    status: {
      type: String,
      enum: [
        'draft',
        'published'
      ],
      default: 'published'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

weddingSchema.index({
  createdAt: -1
});

module.exports = mongoose.model(
  'Wedding',
  weddingSchema
);