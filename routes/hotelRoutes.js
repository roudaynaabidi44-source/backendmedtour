const express = require('express');
const router = express.Router();

const Hotel = require('../models/Hotel');


// ===== AJOUTER HÔTEL =====
router.post('/hotels', async (req, res) => {
  try {

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      data: hotel
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});

module.exports = router;