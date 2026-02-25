const express = require("express");
const router = express.Router();
const rdvController = require("../controllers/rendezVousController");

router.post("/", rdvController.ajouterRendezVous);
router.get("/", rdvController.listerRendezVous);
router.get("/:id", rdvController.getRendezVousById);
router.put("/:id", rdvController.updateRendezVous);
router.delete("/:id", rdvController.deleteRendezVous);

module.exports = router;