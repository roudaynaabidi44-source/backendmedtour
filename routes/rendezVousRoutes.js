const express = require('express');
const router = express.Router();
const RendezVous = require('../models/RendezVous');
const { authMiddleware } = require('../middleware/auth');

// ================= CREATE RDV =================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      doctorId,
      cliniqueId,
      specialite,
      dateRendezVous,
      heureRendezVous,
      motif
    } = req.body;

    // ⛔ CHECK disponibilité
    const exist = await RendezVous.findOne({
      doctorId,
      dateRendezVous,
      heureRendezVous,
      status: { $ne: 'annule' }
    });

    if (exist) {
      return res.status(400).json({
        success: false,
        message: '⛔ Créneau déjà réservé'
      });
    }

    const rdv = new RendezVous({
      patientId: req.user._id,
      doctorId,
      cliniqueId,
      specialite,
      dateRendezVous,
      heureRendezVous,
      motif
    });

    await rdv.save();

    res.json({ success: true, data: rdv });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= SLOTS =================
router.get('/slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const allSlots = [
      "09:00","10:00","11:00",
      "14:00","15:00","16:00"
    ];

    const taken = await RendezVous.find({
      doctorId,
      dateRendezVous: date
    });

    const takenHours = taken.map(r => r.heureRendezVous);

    const available = allSlots.filter(h => !takenHours.includes(h));

    res.json({ success: true, slots: available });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// ================= MY RDV =================
router.get('/my', authMiddleware, async (req, res) => {
  const rdvs = await RendezVous.find({ patientId: req.user._id });
  res.json({ success: true, data: rdvs });
});

module.exports = router;