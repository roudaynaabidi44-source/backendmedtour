const RendezVous = require("../models/RendezVous");

// Ajouter un rendez-vous
exports.ajouterRendezVous = async (req, res) => {
  try {
    const nouveauRDV = new RendezVous(req.body);
    await nouveauRDV.save();
    res.status(201).json(nouveauRDV);
  } catch (err) {
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};

// Lister tous les rendez-vous
exports.listerRendezVous = async (req, res) => {
  try {
    const rdvs = await RendezVous.find();
    res.json(rdvs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer un rendez-vous par ID
exports.getRendezVousById = async (req, res) => {
  try {
    const rdv = await RendezVous.findById(req.params.id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    res.json(rdv);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mettre à jour un rendez-vous
exports.updateRendezVous = async (req, res) => {
  try {
    const updatedRDV = await RendezVous.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedRDV) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    res.json(updatedRDV);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un rendez-vous
exports.deleteRendezVous = async (req, res) => {
  try {
    const deletedRDV = await RendezVous.findByIdAndDelete(req.params.id);
    if (!deletedRDV) return res.status(404).json({ message: "Rendez-vous non trouvé" });
    res.json({ message: "Rendez-vous supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};