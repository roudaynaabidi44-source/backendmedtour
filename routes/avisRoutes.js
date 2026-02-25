const express = require("express");
const router = express.Router();
const avisController = require("../controllers/avisController");

router.post("/", avisController.ajouterAvis);
router.get("/", avisController.listerAvis);
router.get("/:id", avisController.getAvisById);
router.put("/:id", avisController.updateAvis);
router.delete("/:id", avisController.deleteAvis);

module.exports = router;