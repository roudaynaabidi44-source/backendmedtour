const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/messageController');

router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.patch('/:id/read', markAsRead);

module.exports = router;