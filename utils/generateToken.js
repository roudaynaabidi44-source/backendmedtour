const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mon_secret_super_securise_2024";

const generateToken = (id, email) => {
  return jwt.sign(
    { id, email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;