const Patient = require("../models/Patient");
const Avis = require("../models/Avis");
const Devis = require("../models/Devis");

// ➜ Ajouter patient
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Prendre rendez-vous
exports.prendreRendezVous = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    patient.rendezVous.push(req.body);// controllers/patientController.js
const Patient = require("../models/Patient");
const RendezVous = require("../models/RendezVous");
const Avis = require("../models/Avis");
const Devis = require("../models/Devis");
const Consultation = require("../models/Consultation");

// ➜ Créer un patient
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Prendre un rendez-vous
exports.prendreRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.create({
      ...req.body,
      patient: req.params.id
    });
    res.status(201).json(rdv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Lister ses rendez-vous
exports.listerMesRendezVous = async (req, res) => {
  try {
    const rdvs = await RendezVous.find({ patient: req.params.id })
      .populate("medecin", "nom prenom email");
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Modifier un rendez-vous
exports.modifierRendezVous = async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(req.params.rdvId, req.body, { new: true });
    res.json(rdv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Laisser un avis
exports.laisserAvis = async (req, res) => {
  try {
    const avis = await Avis.create({
      ...req.body,
      patient: req.params.id
    });
    res.status(201).json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Lister ses avis
exports.listerMesAvis = async (req, res) => {
  try {
    const avis = await Avis.find({ patient: req.params.id })
      .populate("medecin", "nom prenom email");
    res.json(avis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Demander un devis
exports.demanderDevis = async (req, res) => {
  try {
    const devis = await Devis.create({
      ...req.body,
      patient: req.params.id
    });
    res.status(201).json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Lister ses devis
exports.listerMesDevis = async (req, res) => {
  try {
    const devis = await Devis.find({ patient: req.params.id })
      .populate("medecin", "nom prenom email");
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Ajouter une consultation
exports.ajouterConsultation = async (req, res) => {
  try {
    const consultation = await Consultation.create({
      ...req.body,
      patient: req.params.id
    });
    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Lister ses consultations
exports.listerMesConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.params.id })
      .populate("medecin", "nom prenom email");
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Modifier rendez-vous
exports.modifierRendezVous = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    const rdv = patient.rendezVous.id(req.params.rdvId);
    rdv.set(req.body);

    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Ajouter avis
exports.ajouterAvis = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    patient.avis.push(req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Ajouter consultation
exports.ajouterConsultation = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    patient.consultations.push(req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
