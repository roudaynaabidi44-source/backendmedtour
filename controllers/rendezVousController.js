const RendezVous = require("../models/RendezVous");

// Patient prend un rendez-vous
exports.prendreRendezVous = async (req, res) => {
  try {
    const { medecin, date, remarque } = req.body;
    const rdv = await RendezVous.create({
      patient: req.user.id, // patient connecté
      medecin,
      date,
      remarque: remarque || "",
      status: "en attente"
    });
    res.status(201).json(rdv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Patient liste ses rendez-vous
exports.listerMesRendezVous = async (req, res) => {
  try {
    const rdvs = await RendezVous.find({ patient: req.user.id })
      .populate("medecin", "nom prenom email");
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Médecin liste ses rendez-vous
exports.listerRendezVousMedecin = async (req, res) => {
  try {
    const rdvs = await RendezVous.find({ medecin: req.user.id })
      .populate("patient", "nom prenom email");
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modifier un rendez-vous (patient ou médecin concerné)
exports.modifierRendezVous = async (req, res) => {
  try {
    const { rdvId } = req.params;
    const rdv = await RendezVous.findById(rdvId);
    if (!rdv) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }
    // Vérifier que l'utilisateur est le patient ou le médecin de ce rdv
    if (rdv.patient.toString() !== req.user.id && rdv.medecin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }
    const updated = await RendezVous.findByIdAndUpdate(rdvId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};