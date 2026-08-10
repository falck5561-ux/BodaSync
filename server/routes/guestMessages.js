const express = require('express');

const {
  getGuestMessages,
  createGuestMessage
} = require('../controllers/guestMessageController');

const router = express.Router();

router.get(
  '/:slug/messages',
  getGuestMessages
);

router.post(
  '/:slug/messages',
  createGuestMessage
);

module.exports = router;