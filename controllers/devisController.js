const Devis = require("../models/Devis");

// Ajouter un devis
exports.ajouterDevis = async (req, res) => {
  try {
    const nouveauDevis = new Devis(req.body);
    await nouveauDevis.save();
    res.status(201).json(nouveauDevis);
  } catch (err) {
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};

// Lister tous les devis
exports.listerDevis = async (req, res) => {
  try {
    const devis = await Devis.find();
    res.json(devis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer un devis par ID
exports.getDevisById = async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id);
    if (!devis) return res.status(404).json({ message: "Devis non trouvé" });
    res.json(devis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mettre à jour un devis
exports.updateDevis = async (req, res) => {
  try {
    const updatedDevis = await Devis.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedDevis) return res.status(404).json({ message: "Devis non trouvé" });
    res.json(updatedDevis);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un devis
exports.deleteDevis = async (req, res) => {
  try {
    const deletedDevis = await Devis.findByIdAndDelete(req.params.id);
    if (!deletedDevis) return res.status(404).json({ message: "Devis non trouvé" });
    res.json({ message: "Devis supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};