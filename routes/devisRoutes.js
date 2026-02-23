const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const devisController = require("../controllers/devisController");

// ➜ Patient demande un devis
router.post("/demander", protect, authorizeRoles(["patient"]), devisController.demanderDevis);

// ➜ Patient voit ses devis
router.get("/mes-devis", protect, authorizeRoles(["patient"]), devisController.listerMesDevis);

// ➜ Admin ou médecin voit tous les devis
router.get("/", protect, authorizeRoles(["admin", "medecin"]), devisController.listerTousDevis);

// ➜ Mettre à jour un devis (admin ou médecin)
router.put("/:id", protect, authorizeRoles(["admin", "medecin"]), devisController.updateDevis);

// ➜ Supprimer un devis (admin uniquement)
router.delete("/:id", protect, authorizeRoles(["admin"]), devisController.deleteDevis);

module.exports = router;