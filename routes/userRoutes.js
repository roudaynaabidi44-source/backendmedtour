///// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middlewares/uploadMiddleware");


console.log("protect:", protect);
console.log("authorizeRoles:", authorizeRoles);




router.post("/register", upload.single("image"), userController.register); 
router.post("/login", userController.login);
router.post("/ajouter",protect,authorizeRoles(["admin"]),userController.ajouterUtilisateur);
router.get("/lister", protect,authorizeRoles(["admin"]), userController.listerUtilisateurs);
router.get("/:id",protect, userController.getUtilisateurById);
router.put("/:id",protect, userController.updateUtilisateur);
router.delete("/:id",protect, userController.deleteUtilisateur);
module.exports = router;
