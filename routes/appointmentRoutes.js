const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentcontroller');
const authMiddleware = require('../middlewares/auth'); // à adapter

// Toutes les routes nécessitent d'être connecté
router.use(authMiddleware);

// --- Routes existantes (création, etc.) ---
router.post('/', appointmentController.createAppointment);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
// etc.

// --- NOUVELLES ROUTES POUR LE MÉDECIN ---

// 1. Récupérer TOUS les rendez-vous du médecin connecté
router.get('/doctor/appointments', appointmentController.getDoctorAppointments);

// 2. Récupérer les demandes en attente du médecin
router.get('/doctor/appointments/pending', appointmentController.getPendingAppointments);

// 3. Récupérer les rendez-vous du jour du médecin
router.get('/doctor/appointments/today', appointmentController.getTodayAppointments);

// 4. Accepter un rendez-vous (passer statut à 'Confirmé')
router.patch('/doctor/appointments/:id/accept', appointmentController.acceptAppointment);

// 5. Refuser un rendez-vous (passer statut à 'rejected')
router.patch('/doctor/appointments/:id/reject', appointmentController.rejectAppointment);

// 6. (Optionnel) Supprimer/annuler un rendez-vous
router.delete('/doctor/appointments/:id', appointmentController.deleteAppointment);

module.exports = router;