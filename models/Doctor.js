const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true
    },

    phone: {
      type: String
    },

    speciality: {
      type: String,
      required: true
    },

    // 👇 مهم للcalendar (أوقات الخدمة)
    workingHours: {
      start: {
        type: String, // مثال "09:00"
        default: "09:00"
      },
      end: {
        type: String, // مثال "17:00"
        default: "17:00"
      }
    },

    // 👇 optional: days available
    workingDays: {
      type: [String], // ["Monday","Tuesday",...]
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },

    location: {
      type: String,
      default: "Clinique"
    },

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);