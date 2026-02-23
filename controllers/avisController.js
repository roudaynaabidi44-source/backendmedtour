const Avis = require("../models/Avis");

// Laisser un avis (patient)
exports.laisserAvis = async (req, res) => {
  try {
    const { medecin, note, commentaire } = req.body;
    const avis = await Avis.create({
      patient: req.user.id,
      medecin,
      note,
      commentaire
    });
    res.status(201).json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister ses avis (patient)
exports.listerMesAvis = async (req, res) => {
  try {
    const avis = await Avis.find({ patient: req.user.id })
      .populate("medecin", "nom prenom email");
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les avis reçus par un médecin
exports.listerAvisMedecin = async (req, res) => {
  try {
    const avis = await Avis.find({ medecin: req.user.id })
      .populate("patient", "nom prenom email");
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};