const express = require("express");
const router = express.Router();
const devisController = require("../controllers/devisController");

router.post("/", devisController.ajouterDevis);
router.get("/", devisController.listerDevis);
router.get("/:id", devisController.getDevisById);
router.put("/:id", devisController.updateDevis);
router.delete("/:id", devisController.deleteDevis);

module.exports = router;