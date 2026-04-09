const Document = require('../models/Document');
const History = require('../models/History');
const cloudinary = require('../config/cloudinary');

// Récupérer les documents
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ patient: req.user.id })
      .sort({ date: -1 });
    
    // Formater les tailles
    const formattedDocs = documents.map(doc => ({
      ...doc.toObject(),
      taille: `${(doc.taille / 1024 / 1024).toFixed(1)} MB`,
    }));

    res.json({
      success: true,
      data: formattedDocs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload de document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    const document = await Document.create({
      patient: req.user.id,
      nom: req.body.nom || req.file.originalname,
      type: req.body.type || 'medical',
      extension: req.file.mimetype.split('/')[1],
      taille: req.file.size,
      tailleFormatted: `${(req.file.size / 1024 / 1024).toFixed(1)} MB`,
      url: req.file.path,
      cloudinaryId: req.file.filename,
    });

    // Ajouter à l'historique
    await History.create({
      patient: req.user.id,
      action: 'Document ajouté',
      details: document.nom,
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    if (document.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Supprimer de Cloudinary
    if (document.cloudinaryId) {
      await cloudinary.uploader.destroy(document.cloudinaryId);
    }

    await document.remove();

    res.json({
      success: true,
      message: 'Document supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};