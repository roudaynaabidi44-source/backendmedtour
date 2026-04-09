const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMedicalFollowUp,
  updateHealthIndicators,
  addConsultation,
} = require('../controllers/medicalController');

router.use(protect);

router.get('/follow-up', getMedicalFollowUp);
router.put('/indicators', updateHealthIndicators);
router.post('/consultations', addConsultation);

module.exports = router;