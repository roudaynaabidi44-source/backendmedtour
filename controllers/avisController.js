const Avis = require("../models/Avis");

// Ajouter un avis
exports.ajouterAvis = async (req, res) => {
  try {
    const nouvelAvis = new Avis(req.body);
    await nouvelAvis.save();
    res.status(201).json(nouvelAvis);
  } catch (err) {
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};

// Lister tous les avis
exports.listerAvis = async (req, res) => {
  try {
    const avis = await Avis.find();
    res.json(avis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Récupérer un avis par ID
exports.getAvisById = async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ message: "Avis non trouvé" });
    res.json(avis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mettre à jour un avis
exports.updateAvis = async (req, res) => {
  try {
    const updatedAvis = await Avis.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedAvis) return res.status(404).json({ message: "Avis non trouvé" });
    res.json(updatedAvis);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un avis
exports.deleteAvis = async (req, res) => {
  try {
    const deletedAvis = await Avis.findByIdAndDelete(req.params.id);
    if (!deletedAvis) return res.status(404).json({ message: "Avis non trouvé" });
    res.json({ message: "Avis supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};