const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
nom: { type: String, required: true },
prenom: String,
email: { type: String, unique: true },
mdp: String,
role: { type: String, enum: ['chef service', 'client', 'medecin'],
default: 'medecin' },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
