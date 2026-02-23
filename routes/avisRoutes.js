const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const avisController = require("../controllers/avisController"); // ✅ correction ici

// ➜ Patient laisse un avis
router.post("/", protect, authorizeRoles(["patient"]), avisController.laisserAvis);

// ➜ Patient voit ses avis
router.get("/", protect, authorizeRoles(["patient"]), avisController.listerMesAvis);

// ➜ Médecin voit les avis qui lui sont destinés
router.get("/medecin", protect, authorizeRoles(["medecin"]), avisController.listerAvisMedecin);

module.exports = router;