const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const rendezVousController = require("../controllers/rendezVousController");

// Patient prend un rendez-vous
router.post("/ajouter", protect, authorizeRoles(["patient"]), rendezVousController.prendreRendezVous);

// Patient liste ses rendez-vous
router.get("/lister/paient", protect, authorizeRoles(["patient"]), rendezVousController.listerMesRendezVous);

// Médecin liste ses rendez-vous
router.get("/lister/medecin", protect, authorizeRoles(["medecin"]), rendezVousController.listerRendezVousMedecin);

// Modifier un rendez-vous
router.put("/:rdvId", protect, authorizeRoles(["patient", "medecin"]), rendezVousController.modifierRendezVous);

module.exports = router;