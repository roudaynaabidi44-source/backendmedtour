const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ================== IMPORTS DES ROUTES ==================
const hotelRoutes = require('./routes/hotelRoutes');
const messageRoutes = require('./routes/messages');

// ================== UPLOAD CONFIGURATION ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

// ================== STRIPE WEBHOOK (RAW) ==================
app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log('❌ Stripe signature error:', err.message);
      return res.status(400).send(`Webhook Error`);
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Paiement OK:', session.id);
    }
    res.json({ received: true });
  }
);

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== ROUTES EXTERNES ==================
app.use('/api', hotelRoutes);
app.use('/api', messageRoutes);

// ================== ROUTES FACTICES (pour éviter 404) ==================
app.get('/api/documents', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/messages', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/patient/stats', async (req, res) => {
  res.json({ success: true, data: { totalVisits: 0, pendingPayments: 0 } });
});
app.get('/api/history', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/medical/follow-up', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/notifications/unread', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/appointments', async (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/payments', async (req, res) => {
  res.json({ success: true, data: [] });
});

// ================== UPLOAD DIRECTORY ==================
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

// ================== MONGODB CONNECTION ==================
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medtour')
  .then(() => {
    console.log('✅ Mongo connecté');
    createAdmin();
    createDoctor();
    createHotel();
  })
  .catch(err => console.log('❌ Mongo error:', err));

// ================== MODELS ==================
const RendezVous = require('./models/RendezVous');
const Clinique = require('./models/Clinique');
const User = require('./models/User');
const Devis = require('./models/Devis');
const Reservation = require('./models/Reservation');
const Message = require('./models/Message');
const Hotel = require('./models/Hotel');
const Historique = require('./models/Historique');
const Avis = require('./models/Avis');
const HistoriqueConsultation = require('./models/historiqueConsultation');

// ================== FONCTIONS DE CRÉATION AUTOMATIQUE ==================
const createAdmin = async () => {
  const existingAdmin = await User.findOne({ email: 'admin@medtour.com' });
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('Admin123!', 10);
    const admin = new User({
      name: 'Administrateur',
      email: 'admin@medtour.com',
      password: hashedPassword,
      accountType: 'admin',
      phone: '0000000000'
    });
    await admin.save();
    console.log('✅ Admin créé : admin@medtour.com / Admin123!');
  } else {
    console.log('ℹ️ Admin existe déjà');
  }
};

const createDoctor = async () => {
  const existingDoctor = await User.findOne({ email: 'majid@medtour.com' });
  if (!existingDoctor) {
    const hashedPassword = bcrypt.hashSync('medecin123', 10);
    const doctor = new User({
      name: 'majid kammoun',
      email: 'majid@medtour.com',
      password: hashedPassword,
      accountType: 'medecin',
      specialite: 'Cardiologie',
      phone: '12345678',
      approved: true,
      location: 'Clinique La Marsa'
    });
    await doctor.save();
    console.log(`✅ Médecin majid kammoun créé avec l'ID: ${doctor._id}`);
  } else {
    console.log('ℹ️ Médecin majid kammoun existe déjà');
  }
};

const createHotel = async () => {
  const existingHotel = await User.findOne({ email: 'hotelmouradi@gmail.com' });
  if (!existingHotel) {
    const hashedPassword = bcrypt.hashSync('hotel123', 10);
    const hotel = new User({
      name: 'hotel mouradi',
      email: 'hotelmouradi@gmail.com',
      password: hashedPassword,
      accountType: 'hotel',
      approved: true,
      phone: '12345678',
      address: 'mall'
    });
    await hotel.save();
    console.log('✅ Hôtel créé : hotelmouradi@gmail.com / hotel123');
  } else {
    console.log('ℹ️ Hôtel existe déjà');
  }
};

// ================== ROUTES PUBLIQUES ==================
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { course } = req.body;
    if (!course || !course.titre || !course.prix) {
      return res.status(400).json({ success: false, message: 'Course invalide' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: course.titre },
          unit_amount: Math.round(course.prix * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/register', upload.single('diplome'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      phone,
      address,
      fax,
      specialite
    } = req.body || {};

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const allowedRoles = ['patient', 'medecin', 'clinique', 'hotel', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide' });
    }

    if (role !== 'hotel' && !phone) {
      return res.status(400).json({ success: false, message: 'Le téléphone est requis' });
    }
    if (role === 'hotel' && !address) {
      return res.status(400).json({ success: false, message: "L'adresse de l'hôtel est requise" });
    }
    if (role === 'medecin' && !req.file) {
      return res.status(400).json({ success: false, message: 'Le diplôme est requis' });
    }
    if (role === 'medecin' && !specialite) {
      return res.status(400).json({ success: false, message: 'La spécialité est requise' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const userData = {
      name: fullName,
      email,
      password: await bcrypt.hash(password, 10),
      accountType: role,
    };

    if (role !== 'hotel') {
      userData.phone = phone;
    } else {
      userData.address = address;
      userData.fax = fax || '';
      userData.phone = phone || '';
    }

    if (role === 'medecin') {
      userData.specialite = specialite;
      userData.diplome = req.file.path;
    }

    const user = new User(userData);
    await user.save();

    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        email: user.email,
        accountType: user.accountType,
        role: user.accountType,
        phone: user.phone,
        address: user.address,
        fax: user.fax,
        specialite: user.specialite,
      }
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Tentative login:", { email });

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    if (user.accountType !== 'patient' && user.accountType !== 'admin' && user.accountType !== 'hotel' && !user.approved) {
      return res.status(403).json({
        success: false,
        message: "⏳ Votre compte est en attente de validation par un administrateur."
      });
    }

    const token = Buffer.from(`${user._id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: "Connexion réussie",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let userId;
    try {
      userId = Buffer.from(token, 'base64').toString().split(':')[0];
    } catch {
      return res.status(401).json({ success: false });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false });
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false });
    const fullName = user.name || '';
    const spaceIndex = fullName.indexOf(' ');
    const firstName = spaceIndex > 0 ? fullName.substring(0, spaceIndex) : fullName;
    const lastName = spaceIndex > 0 ? fullName.substring(spaceIndex + 1) : '';
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        firstName,
        lastName,
        email: user.email,
        phone: user.phone || '',
        accountType: user.accountType
      }
    });
  } catch {
    res.status(401).json({ success: false });
  }
});

// ================== CLINIQUES & SPÉCIALITÉS ==================
app.get('/api/cliniques', async (req, res) => {
  try {
    const data = await Clinique.find();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cliniques/:id', async (req, res) => {
  try {
    const data = await Clinique.findById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cliniques/:id/complete', async (req, res) => {
  try {
    const clinique = await Clinique.findById(req.params.id);
    if (!clinique) return res.status(404).json({ success: false });
    const cliniqueComplete = {
      ...clinique._doc,
      medecins: [
        { nom: "Dr. Mohamed Ali", specialite: "Cardiologie", experience: 15, photo: "👨‍⚕️", prix: 80 },
        { nom: "Dr. Sarah Ben Salah", specialite: "Dermatologie", experience: 10, photo: "👩‍⚕️", prix: 65 },
        { nom: "Dr. Ahmed Khelil", specialite: "Gynécologie", experience: 12, photo: "👨‍⚕️", prix: 70 },
        { nom: "Dr. Leila Trabelsi", specialite: "Pédiatrie", experience: 8, photo: "👩‍⚕️", prix: 55 },
        { nom: "Dr. Nabil Ben Amor", specialite: "Ophtalmologie", experience: 20, photo: "👨‍⚕️", prix: 60 },
        { nom: "Dr. Ines Gharbi", specialite: "Dentisterie", experience: 7, photo: "👩‍⚕️", prix: 75 },
        { nom: "Dr. Karim Boussaa", specialite: "Orthopédie", experience: 14, photo: "👨‍⚕️", prix: 85 },
        { nom: "Dr. Sonia Mzali", specialite: "Psychiatrie", experience: 9, photo: "👩‍⚕️", prix: 90 },
        { nom: "Dr. Hichem Mansour", specialite: "Médecine Générale", experience: 11, photo: "👨‍⚕️", prix: 50 }
      ],
      infirmiers: [
        { nom: "Fatima Ben Ali", role: "Infirmière chef", experience: 12 },
        { nom: "Nour Jaziri", role: "Infirmière anesthésiste", experience: 8 },
        { nom: "Omar Saidi", role: "Infirmier polyvalent", experience: 6 },
        { nom: "Rim Bouzid", role: "Infirmière en blocs", experience: 5 },
        { nom: "Walid Hammami", role: "Infirmier urgentiste", experience: 7 }
      ],
      chambres: [
        { type: "Chambre Standard", nombre: 15, equipement: "Lit médicalisé, TV, WiFi, climatisation", tarif: 80 },
        { type: "Chambre Double", nombre: 10, equipement: "2 lits, salle de bain privée, téléphone", tarif: 120 },
        { type: "Chambre VIP", nombre: 5, equipement: "Suite luxe, télévision écran plat, minibar, canapé", tarif: 180 },
        { type: "Chambre PMR", nombre: 3, equipement: "Accès handicapé, salle de bain adaptée, lit médicalisé", tarif: 100 }
      ],
      blocs_operatoires: [
        { nom: "Bloc A - Cardiologie", equipement: "Table d'opération, moniteur, respirateur", disponibilite: "Lun-Ven 8h-18h" },
        { nom: "Bloc B - Orthopédie", equipement: "Arthroscope, C-arm, scie spécialisée", disponibilite: "Lun-Ven 8h-16h" },
        { nom: "Bloc C - Urgences", equipement: "Équipement complet, salle de réveil", disponibilite: "24h/24" }
      ],
      repas: [
        { type: "Petit-déjeuner", description: "Buffet varié : café, thé, lait, viennoiseries, fruits", horaire: "7h30 - 9h30" },
        { type: "Déjeuner", description: "Menu diététique : entrée, plat chaud, dessert", horaire: "12h00 - 14h00" },
        { type: "Dîner", description: "Repas léger : soupe, salade, fromage", horaire: "18h30 - 20h30" },
        { type: "Régime spécial", description: "Adapté aux besoins médicaux", horaire: "Sur demande" }
      ],
      packs_handicap: [
        { nom: "Pack Accessibilité Simple", description: "Chambre PMR + Accompagnement", prix: "150 €/jour", inclus: ["Chambre adaptée", "Accompagnement personnalité", "Petit-déjeuner inclus"] },
        { nom: "Pack Assistance Complète", description: "Soins + Transport + Hébergement", prix: "250 €/jour", inclus: ["Chambre VIP PMR", "Soins médicaux", "Transferts aéroport", "Repas spéciaux"] }
      ]
    };
    res.json({ success: true, data: cliniqueComplete });
  } catch (err) {
    console.error("❌ Erreur chargement complet:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cliniques/:id/prix', async (req, res) => {
  try {
    const clinique = await Clinique.findById(req.params.id);
    if (!clinique) return res.status(404).json({ success: false });
    const prixParSpecialite = {
      "Cardiologie": 80, "Dermatologie": 65, "Gynécologie": 70, "Pédiatrie": 55,
      "Ophtalmologie": 60, "Dentisterie": 75, "Orthopédie": 85, "Psychiatrie": 90,
      "Médecine Générale": 50
    };
    const specialitesAvecPrix = (clinique.specialites || []).map(spec => ({ nom: spec, prix: prixParSpecialite[spec] || 70 }));
    res.json({ success: true, data: specialitesAvecPrix });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/clinics', async (req, res) => {
  try {
    const clinics = await User.find({ accountType: 'clinique', approved: true }).select('-password');
    res.json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/specialites', async (req, res) => {
  try {
    const specialites = [
      "Cardiologie", "Dermatologie", "Gynécologie", "Pédiatrie", "Ophtalmologie",
      "Dentisterie générale", "Chirurgie dentaire", "Implants dentaires", "Orthodontie",
      "Parodontologie", "Endodontie", "Chirurgie maxillo-faciale", "Chirurgie générale",
      "Orthopédie", "Psychiatrie", "Médecine Générale"
    ];
    res.json({ success: true, data: specialites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== MÉDECINS (DOCTORS) ==================
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialite } = req.query;
    let query = { accountType: 'medecin' };
    if (specialite && specialite !== '') query.specialite = specialite;
    const doctors = await User.find(query).select('-password');
    res.json({ success: true, data: doctors });
  } catch (err) {
    console.error("❌ Error fetching doctors:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, accountType: 'medecin' }).select('-password');
    if (!doctor) return res.status(404).json({ success: false, message: 'Médecin non trouvé' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/medecins', async (req, res) => {
  try {
    const { specialite } = req.query;
    let query = { accountType: 'medecin' };
    if (specialite && specialite !== '') query.specialite = specialite;
    const doctors = await User.find(query).select('-password');
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/medecins/:doctorId/rendez-vous', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const doctor = await User.findById(userId);
    if (!doctor || (doctor.accountType !== 'medecin' && doctor.accountType !== 'admin')) {
      return res.status(403).json({ success: false });
    }
    const doctorId = doctor.accountType === 'medecin' ? userId : req.params.doctorId;
    const rendezVous = await RendezVous.find({ doctorId }).populate('patientId', 'name email phone').sort({ dateRendezVous: -1 });
    res.json({ success: true, data: rendezVous });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/medecins/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, accountType: 'medecin' }).select('-password');
    if (!doctor) return res.status(404).json({ success: false });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/medecins/specialite/:specialite', async (req, res) => {
  try {
    const specialite = decodeURIComponent(req.params.specialite);
    const medecins = await User.find({ accountType: 'medecin', specialite }).select('-password');
    const medecinsWithAvis = medecins.map(m => ({
      ...m._doc,
      note: (Math.random() * 2 + 3).toFixed(1),
      nbAvis: Math.floor(Math.random() * 100) + 5,
      avis: [
        { patient: "Marie D.", commentaire: "Très bon médecin, à l'écoute", note: 5, date: "2025-03-10" },
        { patient: "Jean P.", commentaire: "Professionnel et rassurant", note: 4, date: "2025-03-05" }
      ]
    }));
    res.json({ success: true, data: medecinsWithAvis });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== FAVORIS ==================
app.post('/api/favoris', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const { medecinId } = req.body;
    const user = await User.findById(userId);
    if (!user.favoris) user.favoris = [];
    if (!user.favoris.includes(medecinId)) {
      user.favoris.push(medecinId);
      await user.save();
    }
    res.json({ success: true, message: "✅ Ajouté aux favoris" });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== OFFRES PAR SPÉCIALITÉ ==================
app.get('/api/offres/specialite/:specialite', async (req, res) => {
  try {
    const specialite = decodeURIComponent(req.params.specialite);
    const offres = [
      { id: 1, titre: "Pack Bien-Être", description: "Consultation + bilan complet", prix: 85, duree: "1h", promo: null, note: 4.8, nbAvis: 45 },
      { id: 2, titre: "Forfait Soins", description: "3 consultations + suivi", prix: 220, duree: "3 mois", promo: "-15%", note: 4.5, nbAvis: 32 },
      { id: 3, titre: "Urgence", description: "Consultation sans rdv", prix: 45, duree: "30min", promo: null, note: 4.2, nbAvis: 28 }
    ];
    const avisOffres = [
      { patient: "Sophie L.", commentaire: "Offre géniale, très satisfaite", note: 5, offre: "Pack Bien-Être" },
      { patient: "Karim M.", commentaire: "Rapport qualité prix excellent", note: 4, offre: "Forfait Soins" }
    ];
    res.json({ success: true, data: offres, avis: avisOffres });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== RDV ==================
app.post('/api/rendez-vous', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }
    const token = authHeader.split(' ')[1];
    let patientId;
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      patientId = decoded.split(':')[0];
      if (!patientId.match(/^[0-9a-fA-F]{24}$/)) throw new Error();
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token invalide" });
    }
    const { doctorId, cliniqueId, specialite, dateRendezVous, heureRendezVous, motif } = req.body;
    if (!doctorId || !dateRendezVous || !heureRendezVous) {
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants" });
    }
    const dateFormatted = new Date(dateRendezVous).toISOString().split('T')[0];
    const exist = await RendezVous.findOne({ doctorId, dateRendezVous: dateFormatted, heureRendezVous, status: { $ne: 'Annulé' } });
    if (exist) {
      return res.status(400).json({ success: false, message: "Créneau déjà réservé" });
    }
    const rdv = new RendezVous({
      patientId,
      doctorId,
      cliniqueId: cliniqueId || null,
      specialite: specialite || '',
      dateRendezVous: dateFormatted,
      heureRendezVous,
      motif: motif || '',
      status: 'En attente'
    });
    await rdv.save();
    try {
      const newHistorique = new Historique({
        patientId,
        action: 'Rendez-vous pris',
        description: `${specialite || 'Consultation'} avec un médecin`,
        refId: rdv._id,
        typeRef: 'RendezVous',
        date: new Date()
      });
      await newHistorique.save();
    } catch (err) { console.error("Erreur historique rdv:", err); }
    res.status(201).json({ success: true, data: rdv, message: "Rendez-vous confirmé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/rendez-vous/slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    if (!doctorId || !date) return res.status(400).json({ success: false });
    const doctor = await User.findOne({ _id: doctorId, accountType: 'medecin' });
    if (!doctor) return res.status(404).json({ success: false });
    const allSlots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];
    const dateFormatted = new Date(date).toISOString().split('T')[0];
    const existingRdvs = await RendezVous.find({ doctorId, dateRendezVous: dateFormatted, status: { $ne: 'Annulé' } }).select('heureRendezVous');
    const bookedSlots = existingRdvs.map(rdv => rdv.heureRendezVous);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    res.json({ success: true, slots: availableSlots });
  } catch (err) {
    console.error("❌ Erreur créneaux:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/user/rendez-vous', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    const patientId = Buffer.from(token, 'base64').toString().split(':')[0];
    const rdvs = await RendezVous.find({ patientId }).populate('doctorId', 'name specialite').sort({ dateRendezVous: -1 });
    res.json({ success: true, data: rdvs });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================== DEVIS ==================
app.post('/api/devis', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const { cliniqueId, specialite, medecinId, montantEstimeParPatient, details } = req.body;
    if (!cliniqueId || !specialite) return res.status(400).json({ success: false });
    const clinique = await User.findOne({ _id: cliniqueId, accountType: 'clinique' });
    if (!clinique) return res.status(404).json({ success: false });
    let medecinNom = null;
    if (medecinId) {
      const medecin = await User.findOne({ _id: medecinId, accountType: 'medecin' });
      if (medecin) medecinNom = medecin.name;
    }
    const newDevis = new Devis({
      patientId: userId,
      cliniqueId: clinique._id,
      cliniqueNom: clinique.name,
      specialite,
      medecinId: medecinId || null,
      medecinNom: medecinNom || '',
      montantEstimeParPatient: montantEstimeParPatient || 0,
      status: 'en_attente',
      details: details || {},
      dateDemande: new Date()
    });
    await newDevis.save();
    try {
      const newHistorique = new Historique({
        patientId: userId,
        action: 'Devis demandé',
        description: `${specialite} - ${clinique.name}`,
        montant: montantEstimeParPatient,
        refId: newDevis._id,
        typeRef: 'Devis',
        date: new Date()
      });
      await newHistorique.save();
    } catch (err) { console.error("Erreur historique devis:", err); }
    res.status(201).json({ success: true, message: "Demande de devis envoyée", devis: newDevis });
  } catch (err) {
    console.error("❌ Erreur POST /api/devis:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/mes-devis', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const devis = await Devis.find({ patientId: userId }).populate('cliniqueId', 'nom').sort({ dateDemande: -1 });
    res.json({ success: true, data: devis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/clinic/devis', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let cliniqueId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(cliniqueId);
    if (!user || user.accountType !== 'clinique') return res.status(403).json({ success: false });
    const devis = await Devis.find({ cliniqueId }).populate('patientId', 'name email phone').sort({ dateDemande: -1 });
    res.json({ success: true, data: devis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/devis/:id/repondre', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    let cliniqueId = Buffer.from(token, 'base64').toString().split(':')[0];
    const { status, montantPropose, messageReponse } = req.body;
    const devis = await Devis.findOne({ _id: req.params.id, cliniqueId });
    if (!devis) return res.status(404).json({ success: false });
    devis.status = status;
    devis.reponse = { montantPropose: montantPropose || 0, message: messageReponse || '', dateReponse: new Date() };
    if (status === 'accepte' && montantPropose) {
      devis.montantNumerique = montantPropose;
      devis.montant = `${montantPropose} €`;
    }
    devis.dateReponse = new Date();
    devis.messageReponse = messageReponse;
    await devis.save();
    try {
      const patientId = devis.patientId;
      if (patientId) {
        const actionText = status === 'accepte' ? 'Devis accepté' : (status === 'refuse' ? 'Devis refusé' : 'Devis mis à jour');
        const newHistorique = new Historique({
          patientId,
          action: actionText,
          description: `${devis.specialite} - ${devis.cliniqueNom}`,
          montant: montantPropose || devis.montantNumerique,
          refId: devis._id,
          typeRef: 'Devis',
          date: new Date()
        });
        await newHistorique.save();
      }
    } catch (err) { console.error("Erreur historique réponse devis:", err); }
    res.json({ success: true, message: "Réponse enregistrée", data: devis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/devis/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const devis = await Devis.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!devis) return res.status(404).json({ success: false });
    res.json({ success: true, data: devis });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ================== RÉSERVATIONS ==================
app.post('/api/reservations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const { packNom, prix, devise, dateDepart, dateRetour, patientInfo } = req.body;
    if (!packNom) return res.status(400).json({ success: false, message: "Nom du pack requis" });
    const newReservation = new Reservation({
      patientId: userId,
      type: 'pack',
      packNom,
      prix: prix || 0,
      devise: devise || '€',
      statut: 'Confirmée',
      dateDepart: dateDepart || null,
      dateRetour: dateRetour || null,
      details: { patientInfo }
    });
    await newReservation.save();
    try {
      const newHistorique = new Historique({
        patientId: userId,
        action: 'Pack réservé',
        description: `${packNom} - ${prix} ${devise}`,
        montant: prix,
        refId: newReservation._id,
        typeRef: 'Reservation',
        date: new Date()
      });
      await newHistorique.save();
    } catch (err) { console.error("Erreur historique réservation:", err); }
    res.status(201).json({ success: true, message: "Réservation enregistrée", data: newReservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const reservations = await Reservation.find({ patientId: userId }).sort({ dateReservation: -1 });
    res.json({ success: true, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== MOT DE PASSE OUBLIÉ ==================
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "Si cet email existe, un lien a été envoyé" });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      to: email,
      subject: 'Réinitialisation mot de passe - MediTour',
      html: `<p>Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.</p>`
    });
    res.json({ success: true, message: "Email envoyé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.put('/api/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: "Lien invalide ou expiré" });
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ success: false, message: "Mot de passe trop court" });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ================== ROUTES ADMIN ==================
const authToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const userId = decoded.split(':')[0];
    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

const adminOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.accountType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès interdit' });
  }
  next();
};

app.get('/api/admin/users', authToken, adminOnly, async (req, res) => {
  const users = await User.find({ accountType: { $ne: 'admin' } }).select('-password');
  res.json({ success: true, data: users });
});

app.get('/api/admin/cliniques', authToken, adminOnly, async (req, res) => {
  try {
    const { statut, search } = req.query;
    let filter = { accountType: 'clinique' };
    if (statut === 'approved') filter.approved = true;
    else if (statut === 'pending') filter.approved = false;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const cliniques = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: cliniques });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/medecins', authToken, adminOnly, async (req, res) => {
  try {
    const { statut, search } = req.query;
    let filter = { accountType: 'medecin' };
    if (statut === 'approved') filter.approved = true;
    else if (statut === 'pending') filter.approved = false;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const medecins = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: medecins });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/settings', authToken, adminOnly, async (req, res) => {
  res.json({ success: true, data: { siteName: "MediTour", contactEmail: "admin@medtour.com", version: "1.0.0" } });
});

app.get('/api/admin/stats', authToken, adminOnly, async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ accountType: 'patient' });
    const totalReservations = await Reservation.countDocuments();
    const totalGains = await Devis.aggregate([{ $group: { _id: null, total: { $sum: '$montantNumerique' } } }]);
    const newClinics = await User.countDocuments({ accountType: 'clinique', verified: false });
    res.json({ success: true, data: { totalPatients, totalReservations, totalGains: totalGains[0]?.total || 0, newClinics } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put('/api/admin/users/:id/toggle-status', authToken, adminOnly, async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  res.json({ success: true, data: user });
});

app.patch('/api/admin/users/:id', authToken, adminOnly, async (req, res) => {
  try {
    const { verified } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { verified }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ success: false });
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/devis', authToken, adminOnly, async (req, res) => {
  try {
    const devis = await Devis.find().populate('patientId', 'name email').sort({ dateDemande: -1 });
    res.json({ success: true, data: devis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/appointments', authToken, adminOnly, async (req, res) => {
  try {
    const appointments = await RendezVous.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialite')
      .populate('cliniqueId', 'nom ville')
      .sort({ dateRendezVous: -1, heureRendezVous: 1 });
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/pending-accounts', authToken, adminOnly, async (req, res) => {
  const pending = await User.find({ accountType: { $in: ['medecin', 'clinique', 'hotel'] }, approved: false }).select('-password');
  res.json({ success: true, data: pending });
});

app.put('/api/admin/approve-user/:id', authToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false });
    console.log(`✅ Compte approuvé : ${user.email} (${user.accountType})`);
    res.json({ success: true, data: user, message: 'Compte approuvé' });
  } catch (err) {
    console.error('❌ Erreur approbation:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/medecin/:id/decision', authToken, adminOnly, async (req, res) => {
  const { approved, message } = req.body;
  try {
    const medecin = await User.findByIdAndUpdate(req.params.id, { approved, refusMessage: message || '' }, { new: true });
    if (!medecin) return res.status(404).json({ success: false });
    res.json({ success: true, data: medecin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/reject-user/:id', authToken, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false });
    console.log(`❌ Compte refusé : ${user.email} (${user.accountType})`);
    res.json({ success: true, data: user, message: 'Compte refusé' });
  } catch (err) {
    console.error('❌ Erreur refus:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/recent-activity', authToken, adminOnly, async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name accountType createdAt');
    const recentDevis = await Devis.find().sort({ dateDemande: -1 }).limit(5).populate('patientId', 'name');
    const recentReservations = await Reservation.find().sort({ dateReservation: -1 }).limit(5);
    res.json({ success: true, data: { recentUsers, recentDevis, recentReservations } });
  } catch (err) {
    console.error("❌ Erreur /api/admin/recent-activity :", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/users/:id', authToken, adminOnly, async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json({ success: true, data: updated });
});

app.delete('/api/admin/users/:id', authToken, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.delete('/api/admin/appointments/:id', authToken, adminOnly, async (req, res) => {
  await RendezVous.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.put('/api/admin/appointments/:id', authToken, adminOnly, async (req, res) => {
  const { date, type, docteur, statut, notes, lieu } = req.body;
  const updated = await RendezVous.findByIdAndUpdate(req.params.id, {
    dateRendezVous: date.split('T')[0],
    heureRendezVous: date.split('T')[1].slice(0,5),
    motif: type,
    doctorId: docteur,
    status: statut,
    lieu,
    notes
  }, { new: true });
  res.json({ success: true, data: updated });
});

app.put('/api/admin/settings', authToken, adminOnly, (req, res) => {
  res.json({ success: true });
});

app.post('/api/admin/cliniques', authToken, adminOnly, async (req, res) => {
  try {
    const clinique = new Clinique(req.body);
    await clinique.save();
    res.status(201).json({ success: true, data: clinique });
  } catch (err) {
    console.error("❌ Erreur création clinique:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== AVIS ==================
const authPatientAvis = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'patient') return res.status(403).json({ success: false });
    req.userId = userId;
    next();
  } catch (err) {
    res.status(401).json({ success: false });
  }
};

// POST /api/avis - étendu pour gérer les hôtels
app.post('/api/avis', authPatientAvis, async (req, res) => {
  try {
    const { targetType, targetId, note, commentaire } = req.body;
    if (!['medecin', 'clinique', 'hotel'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Type de cible invalide' });
    }
    let targetExists;
    if (targetType === 'medecin') {
      targetExists = await User.findOne({ _id: targetId, accountType: 'medecin' });
    } else if (targetType === 'clinique') {
      targetExists = await User.findOne({ _id: targetId, accountType: 'clinique' });
    } else if (targetType === 'hotel') {
      targetExists = await User.findOne({ _id: targetId, accountType: 'hotel' });
    }
    if (!targetExists) {
      return res.status(404).json({ success: false, message: 'Destinataire introuvable' });
    }
    const avis = new Avis({
      targetType,
      targetId,
      targetModel: 'User',
      note,
      commentaire,
      patientId: req.userId,
      verified: false
    });
    await avis.save();
    res.status(201).json({ success: true, message: 'Avis enregistré, en attente de modération' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/avis/:targetType/:targetId - déjà générique
app.get('/api/avis/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const avis = await Avis.find({ targetType, targetId, verified: true }).populate('patientId', 'name').sort({ date: -1 });
    res.json({ success: true, data: avis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Permettre à un hôtel de répondre à un avis
const authHotelForAvis = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'hotel') return res.status(403).json({ success: false });
    req.userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false });
  }
};

app.post('/api/hotel/avis/:id/repondre', authHotelForAvis, async (req, res) => {
  try {
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ success: false });
    if (avis.targetId.toString() !== req.userId) return res.status(403).json({ success: false });
    const { response } = req.body;
    avis.response = response;
    await avis.save();
    res.json({ success: true, message: 'Réponse enregistrée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/avis/:id/verify', authToken, adminOnly, async (req, res) => {
  try {
    const { verified } = req.body;
    const avis = await Avis.findByIdAndUpdate(req.params.id, { verified }, { new: true });
    if (!avis) return res.status(404).json({ success: false });
    res.json({ success: true, data: avis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/avis/pending', authToken, adminOnly, async (req, res) => {
  try {
    const pending = await Avis.find({ verified: false }).populate('patientId', 'name').populate('targetId', 'name').sort({ date: 1 });
    res.json({ success: true, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/avis/stats', authToken, adminOnly, async (req, res) => {
  try {
    const stats = await Avis.aggregate([{ $match: { verified: true } }, { $group: { _id: null, avgNote: { $avg: '$note' }, count: { $sum: 1 } } }]);
    const avg = stats[0]?.avgNote || 0;
    const count = stats[0]?.count || 0;
    res.json({ success: true, data: { avgNote: Math.round(avg * 10) / 10, totalVerified: count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== HÔTELS (catalogue) ==================
app.get('/api/admin/hotels', authToken, adminOnly, async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/hotels/:id', authToken, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false });
    res.json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/hotels', authToken, adminOnly, async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/admin/hotels/:id', authToken, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ success: false });
    res.json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/hotels/:id', authToken, adminOnly, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ success: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const hotels = await Hotel.find({ statut: 'Actif' }).sort({ nom: 1 });
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/hotel/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hôtel non trouvé' });
    res.json({ success: true, data: hotel });
  } catch (err) {
    console.error("❌ Erreur GET /api/hotel/:id:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== GESTION DES CHAMBRES PAR L'HÔTEL ==================
// ================== HÔTEL : AUTH & GESTION ==================
const authHotel = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'hotel')
      return res.status(403).json({ success: false, message: 'Accès réservé aux hôtels' });
    req.userId = userId;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// Helper : obtenir ou créer le document Hotel lié à l'utilisateur
const getOrCreateHotel = async (userId, user) => {
  let hotel = await Hotel.findOne({ userId });
  if (!hotel) {
    hotel = new Hotel({
      userId,
      nom: user.name || 'Mon Hôtel',
      email: user.email,
      telephone: user.phone || '',
      adresse: user.address || '',
      rooms: []
    });
    await hotel.save();
  }
  return hotel;
};

// ===== CHAMBRES =====
app.get('/api/hotel/rooms', authHotel, async (req, res) => {
  try {
    const hotel = await getOrCreateHotel(req.userId, req.user);
    res.json({ success: true, rooms: hotel.rooms || [] });
  } catch (err) {
    console.error('GET /api/hotel/rooms error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/hotel/rooms', authHotel, async (req, res) => {
  try {
    const { nom, prix, description, vue, capacite, disponible } = req.body;
    if (!nom || prix === undefined) {
      return res.status(400).json({ success: false, message: 'Nom et prix requis' });
    }
    const hotel = await getOrCreateHotel(req.userId, req.user);
    hotel.rooms.push({
      nom,
      prix: Number(prix),
      description: description || '',
      vue: vue || 'jardin',
      capacite: capacite || 2,
      disponible: disponible !== undefined ? disponible : true
    });
    await hotel.save();
    res.status(201).json({ success: true, room: hotel.rooms[hotel.rooms.length - 1] });
  } catch (err) {
    console.error('POST /api/hotel/rooms error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/hotel/rooms/:roomId', authHotel, async (req, res) => {
  try {
    const hotel = await getOrCreateHotel(req.userId, req.user);
    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Chambre non trouvée' });
    Object.assign(room, req.body);
    await hotel.save();
    res.json({ success: true, room });
  } catch (err) {
    console.error('PUT /api/hotel/rooms error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/hotel/rooms/:roomId', authHotel, async (req, res) => {
  try {
    const hotel = await getOrCreateHotel(req.userId, req.user);
    const room = hotel.rooms.id(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Chambre non trouvée' });
    room.remove();
    await hotel.save();
    res.json({ success: true, message: 'Chambre supprimée' });
  } catch (err) {
    console.error('DELETE /api/hotel/rooms error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ===== DISPONIBILITÉS (simulées, car votre modèle n'a pas ce champ) =====
app.get('/api/hotel/disponibilites', authHotel, (req, res) => {
  res.json({
    success: true,
    data: {
      chambresStandard: 10,
      chambresSupérieure: 5,
      suites: 3,
      dateMiseÀJour: new Date().toISOString()
    }
  });
});

app.put('/api/hotel/disponibilites', authHotel, (req, res) => {
  // Simule une mise à jour sans persistance (vous pourrez plus tard ajouter un champ dans le modèle)
  res.json({ success: true, message: 'Disponibilités mises à jour (simulation)' });
});

// ===== RÉSERVATIONS (simulées, votre modèle n'a pas de champ reservations) =====
app.get('/api/hotel/reservations', authHotel, (req, res) => {
  res.json({ success: true, data: [] });
});

app.patch('/api/hotel/reservations/:id/confirm', authHotel, (req, res) => {
  res.json({ success: true, message: 'Réservation confirmée (simulation)' });
});

// ===== PROFIL HÔTEL =====
app.get('/api/hotel/profile', authHotel, async (req, res) => {
  try {
    const hotel = await getOrCreateHotel(req.userId, req.user);
    res.json({
      success: true,
      hotel: {
        ...hotel.toObject(),
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address
      }
    });
  } catch (err) {
    console.error('GET /api/hotel/profile error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== PATIENT PROFILE ==================
const patientOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.accountType !== 'patient') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux patients' });
  }
  next();
};

app.get('/api/patient/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== CHANGER LE MOT DE PASSE ==================
app.put('/api/change-password', authToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect.' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    console.error('❌ Erreur change password:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// ================== MESSAGERIE (PATIENT ↔ MÉDECIN/CLINIQUE) – UNE SEULE FOIS ==================
app.get('/api/messages/doctors-clinics', async (req, res) => {
  try {
    const doctors = await User.find({ accountType: 'medecin', approved: true }).select('_id name specialite');
    const clinics = await User.find({ accountType: 'clinique', approved: true }).select('_id name');
    res.json({ success: true, data: { doctors, clinics } });
  } catch (err) {
    console.error('❌ /api/messages/doctors-clinics:', err);
    res.status(500).json({ success: false });
  }
});

app.get('/api/messages/contacts', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'patient') return res.status(403).json({ success: false });
    const messages = await Message.find({ $or: [{ senderId: userId }, { receiverId: userId }] }).sort({ createdAt: -1 });
    const contactIds = new Set();
    messages.forEach(msg => {
      if (msg.senderId.toString() !== userId) contactIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== userId) contactIds.add(msg.receiverId.toString());
    });
    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name accountType specialite');
    const enriched = await Promise.all(contacts.map(async (c) => {
      const lastMsg = await Message.findOne({ $or: [{ senderId: userId, receiverId: c._id }, { senderId: c._id, receiverId: userId }] }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ senderId: c._id, receiverId: userId, read: false });
      return { id: c._id, name: c.name, type: c.accountType === 'medecin' ? `Dr. ${c.specialite || ''}` : 'Clinique', avatar: c.accountType === 'medecin' ? '👨‍⚕️' : '🏥', lastMessage: lastMsg?.content || '', lastTime: lastMsg?.createdAt || null, unreadCount };
    }));
    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('❌ /api/messages/contacts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/messages/conversation/:contactId', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const contactId = req.params.contactId;
    const messages = await Message.find({ $or: [{ senderId: userId, receiverId: contactId }, { senderId: contactId, receiverId: userId }] }).sort({ createdAt: 1 });
    await Message.updateMany({ senderId: contactId, receiverId: userId, read: false }, { $set: { read: true } });
    const formatted = messages.map(m => ({ _id: m._id, from: m.senderId, to: m.receiverId, message: m.content, createdAt: m.createdAt, read: m.read }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('❌ /api/messages/conversation:', err);
    res.status(500).json({ success: false });
  }
});

app.post('/api/messages/send', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const { receiverId, content } = req.body;
    if (!receiverId || !content) return res.status(400).json({ success: false, message: 'Destinataire et contenu requis' });
    const message = new Message({ senderId: userId, receiverId, content, read: false });
    await message.save();
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('❌ POST /api/messages/send:', err);
    res.status(500).json({ success: false });
  }
});

// ================== ROUTES DASHBOARD MÉDECIN ==================
const authMedecin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user || user.accountType !== 'medecin') return res.status(403).json({ success: false });
    req.doctorId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false });
  }
};

app.get('/api/doctor/stats', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const totalPatients = await RendezVous.distinct('patientId', { doctorId }).then(ids => ids.length);
    const totalConsultations = await RendezVous.countDocuments({ doctorId, status: 'Confirmé' });
    const allRdv = await RendezVous.find({ doctorId }).populate('patientId');
    let totalPaid = 0, totalPending = 0;
    for (const rdv of allRdv) {
      if (rdv.status === 'Confirmé') totalPaid += 80;
      else if (rdv.status === 'En attente') totalPending += 80;
    }
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const weeklyStats = days.map(label => ({ label, count: Math.floor(Math.random() * 12) }));
    const recentEarnings = allRdv.slice(0,5).map(rdv => ({
      patientName: rdv.patientId?.name || 'Patient',
      date: rdv.dateRendezVous,
      amount: 80,
      status: rdv.status === 'Confirmé' ? 'payé' : 'en attente'
    }));
    res.json({ success: true, data: { totalPatients, totalConsultations, totalPaid, totalPending, weeklyStats, recentEarnings } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctor/patients', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const rdvs = await RendezVous.find({ doctorId }).populate('patientId');
    const patientsMap = new Map();
    rdvs.forEach(rdv => {
      if (rdv.patientId) patientsMap.set(rdv.patientId._id.toString(), {
        id: rdv.patientId._id,
        nom: rdv.patientId.name,
        email: rdv.patientId.email,
        phone: rdv.patientId.phone || ''
      });
    });
    res.json({ success: true, data: Array.from(patientsMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctor/reviews', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const avis = await Avis.find({ targetType: 'medecin', targetId: doctorId, verified: true }).populate('patientId', 'name').sort({ date: -1 });
    const formatted = avis.map(a => ({ id: a._id, patientName: a.patientId?.name || 'Patient', rating: a.note, comment: a.commentaire, date: a.date || a.createdAt, response: a.response || null }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/doctor/reviews/:id/respond', authMedecin, async (req, res) => {
  try {
    const { response } = req.body;
    const avis = await Avis.findById(req.params.id);
    if (!avis) return res.status(404).json({ success: false });
    if (avis.targetId.toString() !== req.doctorId) return res.status(403).json({ success: false });
    avis.response = response;
    await avis.save();
    res.json({ success: true, message: "Réponse enregistrée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctor/appointments/today', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const today = new Date().toISOString().split('T')[0];
    const rdvs = await RendezVous.find({ doctorId, dateRendezVous: today, status: { $ne: 'Annulé' } }).populate('patientId', 'name');
    const formatted = rdvs.map(rdv => ({ id: rdv._id, patientName: rdv.patientId?.name || 'Patient', time: rdv.heureRendezVous, type: rdv.specialite || 'Consultation', status: rdv.status === 'Confirmé' ? 'confirmé' : 'en attente' }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctor/appointments/pending', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const pending = await RendezVous.find({ doctorId, status: 'En attente' }).populate('patientId', 'name phone');
    const formatted = pending.map(rdv => ({ id: rdv._id, patientName: rdv.patientId?.name || 'Patient', date: rdv.dateRendezVous, time: rdv.heureRendezVous, reason: rdv.motif || 'Non spécifié', phone: rdv.patientId?.phone || '' }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/doctor/appointments', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const allAppointments = await RendezVous.find({ doctorId }).populate('patientId', 'name email phone').sort({ dateRendezVous: -1, heureRendezVous: 1 });
    const formatted = allAppointments.map(rdv => ({ id: rdv._id, patientName: rdv.patientId?.name || 'Patient', date: rdv.dateRendezVous, heure: rdv.heureRendezVous, type: rdv.specialite || 'Consultation', statut: rdv.status, motif: rdv.motif, phone: rdv.patientId?.phone || '' }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Erreur récupération tous RDV:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/doctor/appointments/:id/accept', authMedecin, async (req, res) => {
  try {
    const rdv = await RendezVous.findOne({ _id: req.params.id, doctorId: req.doctorId });
    if (!rdv) return res.status(404).json({ success: false });
    rdv.status = 'Confirmé';
    await rdv.save();
    res.json({ success: true, message: "Rendez-vous accepté" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/doctor/appointments/:id/reject', authMedecin, async (req, res) => {
  try {
    const rdv = await RendezVous.findOne({ _id: req.params.id, doctorId: req.doctorId });
    if (!rdv) return res.status(404).json({ success: false });
    rdv.status = 'Annulé';
    await rdv.save();
    res.json({ success: true, message: "Rendez-vous refusé" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/doctor/appointments/:id/validate', authMedecin, async (req, res) => {
  try {
    const rdv = await RendezVous.findOne({ _id: req.params.id, doctorId: req.doctorId });
    if (!rdv) return res.status(404).json({ success: false });
    rdv.status = 'Terminé';
    await rdv.save();
    res.json({ success: true, message: "Consultation validée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/doctor/appointments/:id', authMedecin, async (req, res) => {
  try {
    const rdv = await RendezVous.findOneAndDelete({ _id: req.params.id, doctorId: req.doctorId });
    if (!rdv) return res.status(404).json({ success: false });
    res.json({ success: true, message: "Rendez-vous supprimé" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.put('/api/doctor/profile', authMedecin, async (req, res) => {
  try {
    const doctorId = req.doctorId;
    const allowed = ['name', 'email', 'phone', 'specialite'];
    const updates = {};
    for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
    const updatedDoctor = await User.findByIdAndUpdate(doctorId, { $set: updates }, { new: true }).select('-password');
    if (!updatedDoctor) return res.status(404).json({ success: false });
    res.json({ success: true, message: 'Profil mis à jour', user: updatedDoctor });
  } catch (err) {
    console.error('Erreur mise à jour profil médecin:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ================== CONTRATS MÉDECIN ↔ CLINIQUE ==================
const Contrat = require('./models/Contrat');

// Créer une proposition de contrat (médecin → clinique)
app.post('/api/doctor/contrats', authMedecin, async (req, res) => {
  try {
    const { cliniqueId, message, conditions, honoraires } = req.body;
    if (!cliniqueId) return res.status(400).json({ success: false, message: 'Clinique requise' });
    const contrat = new Contrat({
      medecinId: req.doctorId,
      cliniqueId,
      message: message || '',
      conditions: conditions || '',
      honoraires: honoraires || 0,
      statut: 'en_attente',
      dateProposition: new Date()
    });
    await contrat.save();
    res.status(201).json({ success: true, data: contrat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Récupérer tous les contrats du médecin connecté
app.get('/api/doctor/contrats', authMedecin, async (req, res) => {
  try {
    const contrats = await Contrat.find({ medecinId: req.doctorId })
      .populate('cliniqueId', 'name email phone')
      .sort({ dateProposition: -1 });
    res.json({ success: true, data: contrats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mettre à jour le statut d'un contrat (le médecin peut annuler)
app.patch('/api/doctor/contrats/:id', authMedecin, async (req, res) => {
  try {
    const { statut } = req.body;
    const contrat = await Contrat.findOneAndUpdate(
      { _id: req.params.id, medecinId: req.doctorId },
      { statut },
      { new: true }
    );
    if (!contrat) return res.status(404).json({ success: false });
    res.json({ success: true, data: contrat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ================== CONTRATS POUR CLINIQUES ==================
// Assure-toi d'avoir le middleware clinicOnly (à créer s'il n'existe pas)

const clinicOnly = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.accountType !== 'clinique') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux cliniques' });
  }
  next();
};

// Récupérer les contrats reçus par la clinique
app.get('/api/clinic/contrats', authToken, clinicOnly, async (req, res) => {
  try {
    const contrats = await Contrat.find({ cliniqueId: req.userId })
      .populate('medecinId', 'name specialite email phone')
      .sort({ dateProposition: -1 });
    res.json({ success: true, data: contrats });
  } catch (err) {
    console.error('❌ GET /api/clinic/contrats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Accepter ou refuser un contrat
app.patch('/api/clinic/contrats/:id', authToken, clinicOnly, async (req, res) => {
  const { action } = req.body; // 'accepter' ou 'refuser'
  const newStatut = action === 'accepter' ? 'accepté' : 'refusé';
  try {
    const contrat = await Contrat.findOneAndUpdate(
      { _id: req.params.id, cliniqueId: req.userId },
      { statut: newStatut, dateReponse: new Date() },
      { new: true }
    );
    if (!contrat) return res.status(404).json({ success: false, message: 'Contrat non trouvé' });
    res.json({ success: true, data: contrat });
  } catch (err) {
    console.error('❌ PATCH /api/clinic/contrats/:id:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// ================== DOCUMENTS & HISTORIQUE ==================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const uploadDocument = multer({ storage: documentStorage });

app.post('/api/documents', uploadDocument.single('document'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  try {
    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Aucun fichier' });
    try {
      const newHistorique = new Historique({ patientId: userId, action: 'Document ajouté', description: file.originalname, refId: null, typeRef: 'Document', date: new Date() });
      await newHistorique.save();
    } catch (err) { console.error("Erreur historique document:", err); }
    res.json({ success: true, message: 'Fichier uploadé avec succès', file: { originalname: file.originalname, path: `/uploads/${file.filename}` } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== ROUTE LOGISTIQUE ==================
app.post('/api/logistique/reserver', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });

  let userId;
  try {
    userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user) throw new Error();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }

  const { type, itemId, serviceNom, dateDebut, dateFin, quantite, options } = req.body;

  if (!type || !itemId || !dateDebut) {
    return res.status(400).json({ success: false, message: 'Données manquantes (type, itemId, dateDebut)' });
  }

  try {
    const reservation = new Reservation({
      patientId: userId,
      type,
      itemId,
      serviceNom: serviceNom || null,
      dateDebut,
      dateFin: dateFin || null,
      quantite: quantite || 1,
      options: options || {},
      statut: 'Confirmée'
    });
    await reservation.save();

    try {
      const HistoriqueModel = require('./models/Historique');
      const historique = new HistoriqueModel({
        patientId: userId,
        action: `Réservation ${type === 'transfert' ? 'transfert' : 'hébergement'}`,
        description: serviceNom || `Service #${itemId}`,
        refId: reservation._id,
        typeRef: 'Reservation',
        date: new Date()
      });
      await historique.save();
    } catch (err) { console.error('Erreur historique logistique:', err); }

    res.json({ success: true, message: 'Réservation enregistrée', data: reservation });
  } catch (err) {
    console.error('❌ Erreur POST /api/logistique/reserver:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/patient/logistic-reservations', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });

  let userId;
  try {
    userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const user = await User.findById(userId);
    if (!user) throw new Error();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }

  try {
    const reservations = await Reservation.find({
      patientId: userId,
      type: { $in: ['transfert', 'hebergement'] }
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: reservations });
  } catch (err) {
    console.error('❌ GET /api/patient/logistic-reservations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== ANNULATION RDV PATIENT ==================
app.delete('/api/rendez-vous/:id/annuler', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });

  let userId;
  try {
    userId = Buffer.from(token, 'base64').toString().split(':')[0];
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }

  try {
    const rdv = await RendezVous.findById(req.params.id);
    if (!rdv) return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    if (rdv.patientId.toString() !== userId) return res.status(403).json({ success: false, message: 'Non autorisé' });
    rdv.status = 'Annulé';
    await rdv.save();
    res.json({ success: true, message: 'Rendez-vous annulé avec succès' });
  } catch (err) {
    console.error('❌ Erreur annulation RDV:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================== TEST ==================
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend OK 🚀' });
});

// ================== START ==================
app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});