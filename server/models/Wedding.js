const mongoose = require('mongoose');

const weddingSchema = new mongoose.Schema(
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
      trim: true
    },

    brideName: {
      type: String,
      required: true,
      trim: true
    },

    eventDate: {
      type: Date,
      required: true
    },

    welcomeMessage: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      name: {
        type: String,
        default: ''
      },
      address: {
        type: String,
        default: ''
      },
      googleMapsUrl: {
        type: String,
        default: ''
      }
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Wedding', weddingSchema);