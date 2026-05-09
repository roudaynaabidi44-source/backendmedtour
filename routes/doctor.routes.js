const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctor.controller');

// 🔍 Get all doctors (optionally by speciality)
router.get('/', doctorController.getDoctors);

// ➕ Create doctor
router.post('/', doctorController.createDoctor);

// 🔎 Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// ✏️ Update doctor
router.put('/:id', doctorController.updateDoctor);

// ❌ Delete doctor
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;