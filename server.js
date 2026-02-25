// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Charger variables d'environnement
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/rendezvous", require("./routes/rendezVousRoutes"));
app.use("/api/avis", require("./routes/avisRoutes"));
app.use("/api/devis", require("./routes/devisRoutes"));
// Route test
app.get("/", (req, res) => {
  res.send("API fonctionne 🚀");
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});