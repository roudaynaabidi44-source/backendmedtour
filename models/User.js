const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mdp: { type: String, required: true },
  image: { type: String }, // 🖼 chemin de l'image
  role: { 
    type: String, 
    enum: ['admin', 'patient', 'medecin'], 
    default: 'patient' 
  },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("mdp")) return next();
  const salt = await bcrypt.genSalt(10);
  this.mdp = await bcrypt.hash(this.mdp, salt);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.mdp);
};

module.exports = mongoose.model("User", userSchema);

