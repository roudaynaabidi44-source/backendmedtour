const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require('../controllers/documentController');

router.use(protect);

router.route('/')
  .get(getDocuments)
  .post(upload.single('document'), uploadDocument);

router.delete('/:id', deleteDocument);

module.exports = router;