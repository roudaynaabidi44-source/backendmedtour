const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const medecinController = require("../controllers/medecinController");

router.get("/dashboard", protect, authorizeRoles("medecin"), medecinController.dashboard);
router.get("/patients", protect, authorizeRoles("medecin"), medecinController.listerPatients);
router.put("/profile", protect, authorizeRoles("medecin"), medecinController.updateProfile);
router.get("/rendezvous", protect, authorizeRoles("medecin"), medecinController.listerRendezVous); 
router.put("/rendezvous/:id", protect, authorizeRoles("medecin"), medecinController.modifierRendezVous);
router.get("/avis", protect, authorizeRoles("medecin"), medecinController.listerAvis); 
router.get("/devis", protect, authorizeRoles("medecin"), medecinController.listerDevis);
router.put("/devis/:id", protect, authorizeRoles("medecin"), medecinController.modifierDevis);

module.exports = router;
