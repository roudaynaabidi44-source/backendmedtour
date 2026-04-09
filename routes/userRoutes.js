const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Auth routes
router.post("/register", userController.register);
router.post("/login", userController.login);

//router.post("/ajouter",protect, authorizeRoles("admin"),userController.ajouterUtilisateur);
//router.get("/lister", protect,authorizeRoles("admin"), userController.listerUtilisateurs);
router.post("/ajouter", userController.ajouterUtilisateur);
router.get("/:id",protect, userController.getUtilisateurById);
router.put("/:id",protect, userController.updateUtilisateur);
router.delete("/:id", protect, userController.deleteUtilisateur);
router.post("/register", upload.single("image"),  userController.register);

module.exports = router;