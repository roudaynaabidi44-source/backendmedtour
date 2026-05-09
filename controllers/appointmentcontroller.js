const Appointment = require('../models/Appointment');

// --- Création d'un rendez-vous (patient) ---
exports.createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // issu du token d'authentification
    const { doctorId, cliniqueId, specialite, dateRendezVous, heureRendezVous, motif } = req.body;

    const newAppointment = new Appointment({
      patientId,
      doctorId,
      cliniqueId,
      specialite,
      date: dateRendezVous,
      heure: heureRendezVous,
      motif,
      statut: 'En attente'   // important
    });

    await newAppointment.save();
    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Récupérer tous les rendez-vous du médecin connecté ---
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    // On peut aussi filtrer pour n'afficher que les dates futures si besoin
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone')   // infos patient
      .sort({ date: -1, heure: -1 });               // tri du plus récent au plus ancien
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Récupérer les demandes en attente du médecin ---
exports.getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const pending = await Appointment.find({ doctorId, statut: 'En attente' })
      .populate('patientId', 'name email phone');
    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Récupérer les rendez-vous du jour du médecin ---
exports.getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
    const todayAppointments = await Appointment.find({
      doctorId,
      date: today
    }).populate('patientId', 'name');
    res.json({ success: true, data: todayAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Accepter un rendez-vous (changer statut en 'Confirmé') ---
exports.acceptAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }

    // Vérifier que le médecin connecté est bien celui du rendez-vous
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (appointment.statut !== 'En attente') {
      return res.status(400).json({ success: false, message: 'Seul un rendez-vous en attente peut être accepté' });
    }

    appointment.statut = 'Confirmé';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Refuser un rendez-vous (changer statut en 'rejected') ---
exports.rejectAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }

    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    if (appointment.statut !== 'En attente') {
      return res.status(400).json({ success: false, message: 'Seul un rendez-vous en attente peut être refusé' });
    }

    appointment.statut = 'rejected';  // ou 'Annulé' selon votre enum
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Supprimer un rendez-vous (optionnel) ---
exports.deleteAppointment = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    await appointment.deleteOne();
    res.json({ success: true, message: 'Rendez-vous supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};