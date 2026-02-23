const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const patientController = require("../controllers/patientController");

// ➜ Créer un patient
router.post("/", patientController.createPatient);

// ➜ Rendez-vous
//router.post("/rendezvous", protect, authorizeRoles("patient"), patientController.prendreRendezVous);
//router.get("/rendezvous", protect, authorizeRoles("patient"), patientController.listerMesRendezVous);
//router.put("/:id/rendezvous/:rdvId", protect, authorizeRoles("patient"), patientController.modifierRendezVous);

// ➜ Avis
//router.post("/:id/avis", protect, authorizeRoles("patient"), patientController.laisserAvis);
//router.get("/:id/avis", protect, authorizeRoles("patient"), patientController.listerMesAvis);

// ➜ Devis
//router.post("/:id/devis", protect, authorizeRoles("patient"), patientController.demanderDevis);
//router.get("/:id/devis", protect, authorizeRoles("patient"), patientController.listerMesDevis);

// ➜ Consultation
//router.post("/:id/consultation", protect, authorizeRoles("patient"), patientController.ajouterConsultation);
//router.get("/:id/consultation", protect, authorizeRoles("patient"), patientController.listerMesConsultations);

module.exports = router;
