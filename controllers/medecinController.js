// controllers/medecinController.js
const User = require("../models/User");
const RendezVous = require("../models/RendezVous");
//const DossierMedical = require("../models/DossierMedical");
const Avis = require("../models/Avis");
const Devis = require("../models/Devis");

// ✅ Dashboard Médecin
exports.dashboard = async (req, res) => {
  try {
    const totalRdv = await RendezVous.countDocuments({ medecin: req.user.id });

    res.json({
      message: "Dashboard Médecin",
      totalRendezVous: totalRdv
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Modifier profil
exports.updateProfile = async (req, res) => {
  try {
    const medecin = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(medecin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lister ses patients
exports.listerPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }); // ou filtrer selon tes règles
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lister les rendez-vous du médecin
exports.listerRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.find({ medecin: req.user.id })
      .populate("patient", "nom prenom");
    res.json(rdv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Modifier un rendez-vous
exports.modifierRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const rdv = await RendezVous.findByIdAndUpdate(id, req.body, { new: true });
    res.json(rdv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lister les avis pour le médecin
exports.listerAvis = async (req, res) => {
  try {
    const avis = await Avis.find({ medecin: req.user.id })
      .populate("patient", "nom prenom");
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Lister les devis pour le médecin
exports.listerDevis = async (req, res) => {
  try {
    const devis = await Devis.find({ medecin: req.user.id })
      .populate("patient", "nom prenom");
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Modifier un devis
exports.modifierDevis = async (req, res) => {
  try {
    const { id } = req.params;
    const devis = await Devis.findByIdAndUpdate(id, req.body, { new: true });
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Consulter les dossiers médicaux
exports.consulterDossier = async (req, res) => {
  try {
    const dossiers = await DossierMedical.find({ medecin: req.user.id })
      .populate("patient", "nom prenom");
    res.json(dossiers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
