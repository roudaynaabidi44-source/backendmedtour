const Devis = require("../models/Devis");

// ➜ Patient demande un devis
exports.demanderDevis = async (req, res) => {
  try {
    const { medecin, description, montant } = req.body;
    const devis = await Devis.create({
      patient: req.user.id, // ID du patient connecté
      medecin,
      description,
      montant
    });
    res.status(201).json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Patient voit ses devis
exports.listerMesDevis = async (req, res) => {
  try {
    const devis = await Devis.find({ patient: req.user.id }) // ID du patient connecté
      .populate("medecin", "nom prenom email");
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Admin ou médecin voit tous les devis (avec filtre si médecin)
exports.listerTousDevis = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'medecin') {
      filter.medecin = req.user.id; // le médecin ne voit que ses devis
    }
    const devis = await Devis.find(filter)
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom email');
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Médecin voit les devis qui lui sont adressés (route spécifique si nécessaire)
exports.listerDevisMedecin = async (req, res) => {
  try {
    const devis = await Devis.find({ medecin: req.user.id }) // ID du médecin connecté
      .populate("patient", "nom prenom email");
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Mettre à jour un devis (admin ou médecin)
exports.updateDevis = async (req, res) => {
  try {
    const { id } = req.params;
    const devis = await Devis.findByIdAndUpdate(id, req.body, { new: true });
    if (!devis) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }
    res.json(devis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➜ Supprimer un devis (admin uniquement)
exports.deleteDevis = async (req, res) => {
  try {
    const devis = await Devis.findByIdAndDelete(req.params.id);
    if (!devis) {
      return res.status(404).json({ message: 'Devis non trouvé' });
    }
    res.json({ message: 'Devis supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};