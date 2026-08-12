const mongoose = require('mongoose');

const guestMessageSchema = new mongoose.Schema(
  {
    wedding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wedding',
      required: true,
      index: true
    },

    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1200
    }
  },
  {
    timestamps: true
  }
);

guestMessageSchema.index({
  wedding: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  'GuestMessage',
  guestMessageSchema
);