// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion BDD
connectDB();

console.log("avisRoutes:", require("./routes/avisRoutes"));


// Routes
app.use("/api/users", require("./routes/userRoutes"));//utilisateurs
app.use("/api/patients", require("./routes/patientRoutes")); // Patients
app.use("/api/medecins", require("./routes/medecinRoutes")); // Médecins
app.use("/api/avis", require("./routes/avisRoutes"));
app.use("/api/devis", require("./routes/devisRoutes"));
app.use("/api/rendezvous", require("./routes/rendezVousRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

