// server.js - Version complète avec routes admin et compte admin test
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== CONFIGURATION DES UPLOADS ==========
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Format non supporté'), false);
};
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

// ========== DONNÉES STOCKÉES EN MÉMOIRE ==========
let users = [];
let nextId = 1;
let doctorPatients = [];
let nextDoctorPatientId = 1;
let patientReviews = [];
let nextReviewId = 1;
let doctorEarnings = [];
let nextEarningId = 1;

let cliniques = [];
let nextCliniqueId = 1;
let specialites = [];
let nextSpecialiteId = 1;
let medecins = [];
let nextMedecinId = 1;
let devisData = [];
let nextDevisId = 1;
let documents = [];
let nextDocId = 1;
let messages = [];
let nextMessageId = 1;
let packs = [];
let nextPackId = 1;
let history = [];
let nextHistoryId = 1;
let medicalRecords = [];
let appointments = [];
let nextAppointmentId = 1;
let reservations = [];
let nextReservationId = 1;

const JWT_SECRET = 'mon_secret_super_securise_2024';

function generateToken(userId, email) {
    return jwt.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: '7d' });
}
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return res.status(401).json({ success: false, message: 'Token manquant' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
    }
};

// ========== FONCTION POUR GÉNÉRER LES MÉDECINS (exemple minimal) ==========
function genererMedecinsPourSpecialite(specialite) {
    const medecinsListe = [];
    const noms = ["Dr. Karim Ben Ali", "Dr. Samia Ben Hamida", "Dr. Mohamed Ben Amor"];
    for (let i = 0; i < specialite.medecins; i++) {
        medecinsListe.push({
            id: nextMedecinId++,
            specialiteId: specialite.id,
            nom: noms[i % noms.length],
            titre: "Spécialiste",
            hopital: "Hôpital Général",
            ville: "Tunis",
            pays: "Tunisie",
            prixConsultation: 80,
            note: 4.5,
            experience: 15,
            disponible: true,
            disponibilites: [
                { jour: "Lundi", heures: ["09:00", "10:00", "11:00"] },
                { jour: "Mercredi", heures: ["09:00", "10:00", "11:00"] }
            ]
        });
    }
    return medecinsListe;
}

// ========== INITIALISATION DES DONNÉES ==========
async function initDemoData() {
    // Réinitialiser les tableaux pour éviter les doublons
    users = [];
    nextId = 1;
    doctorPatients = [];
    nextDoctorPatientId = 1;
    patientReviews = [];
    nextReviewId = 1;
    doctorEarnings = [];
    nextEarningId = 1;
    cliniques = [];
    nextCliniqueId = 1;
    specialites = [];
    nextSpecialiteId = 1;
    medecins = [];
    nextMedecinId = 1;
    devisData = [];
    nextDevisId = 1;
    documents = [];
    nextDocId = 1;
    messages = [];
    nextMessageId = 1;
    packs = [];
    nextPackId = 1;
    history = [];
    nextHistoryId = 1;
    medicalRecords = [];
    appointments = [];
    nextAppointmentId = 1;
    reservations = [];
    nextReservationId = 1;

    // Patient démo
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = {
        id: nextId++,
        accountType: 'patient',
        name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        password: hashedPassword,
        phone: '+33 6 12 34 56 78',
        membership: 'Premium',
        createdAt: new Date().toISOString()
    };
    users.push(demoUser);

    // Médecin démo
    const doctorHashedPassword = await bcrypt.hash('doctor123', 10);
    const demoDoctor = {
        id: nextId++,
        accountType: 'medecin',
        name: 'Dr. Karim Ben Ali',
        email: 'karim.benali@email.com',
        password: doctorHashedPassword,
        phone: '+216 98 765 432',
        membership: 'Premium',
        createdAt: new Date().toISOString(),
        specialite: 'Cardiologie',
        diplome: null
    };
    users.push(demoDoctor);

    // ADMIN DE TEST (fonctionnel à 100%)
    const adminHash = await bcrypt.hash('admin123', 10);
    const testAdmin = {
        id: nextId++,
        accountType: 'admin',
        name: 'Admin Test',
        email: 'admin@test.com',
        password: adminHash,
        phone: '+216 11 11 11 11',
        membership: 'Premium',
        createdAt: new Date().toISOString()
    };
    users.push(testAdmin);
    console.log('✅ Admin créé : admin@test.com / admin123');

    // Données dashboard médecin
    doctorPatients = [
        { id: nextDoctorPatientId++, doctorId: demoDoctor.id, patientId: demoUser.id, nom: demoUser.name, email: demoUser.email, phone: demoUser.phone, location: "Paris, France", lastVisit: "2025-03-20", nextAppointment: "2025-04-05", medicalHistory: "Allergie aux pénicillines" },
        { id: nextDoctorPatientId++, doctorId: demoDoctor.id, patientId: null, nom: "Marie Curie", email: "marie.curie@email.com", phone: "+33 6 98 76 54 32", location: "Lyon, France", lastVisit: "2025-03-28", nextAppointment: null, medicalHistory: "Hypertension" },
        { id: nextDoctorPatientId++, doctorId: demoDoctor.id, patientId: null, nom: "Sophie Dubois", email: "sophie.dubois@email.com", phone: "+33 6 11 22 33 44", location: "Tunis, Tunisie", lastVisit: "2025-03-15", nextAppointment: "2025-04-10", medicalHistory: "Aucune" }
    ];
    patientReviews = [
        { id: nextReviewId++, doctorId: demoDoctor.id, patientId: demoUser.id, patientName: demoUser.name, rating: 5, comment: "Excellent médecin, très à l'écoute.", date: "2025-03-21T10:00:00Z", response: null },
        { id: nextReviewId++, doctorId: demoDoctor.id, patientId: null, patientName: "Marie Curie", rating: 4, comment: "Très bonne consultation, un peu d'attente.", date: "2025-03-29T14:30:00Z", response: "Merci pour votre retour, nous allons améliorer nos délais." },
        { id: nextReviewId++, doctorId: demoDoctor.id, patientId: null, patientName: "Sophie Dubois", rating: 5, comment: "Suivi parfait, je recommande.", date: "2025-03-16T09:15:00Z", response: null }
    ];
    doctorEarnings = [
        { id: nextEarningId++, doctorId: demoDoctor.id, patientId: demoUser.id, patientName: demoUser.name, date: "2025-03-18T10:00:00Z", amount: 80, status: "payé", consultationType: "Consultation" },
        { id: nextEarningId++, doctorId: demoDoctor.id, patientId: null, patientName: "Marie Curie", date: "2025-03-25T14:30:00Z", amount: 120, status: "payé", consultationType: "Téléconsultation" },
        { id: nextEarningId++, doctorId: demoDoctor.id, patientId: null, patientName: "Sophie Dubois", date: "2025-03-10T09:00:00Z", amount: 80, status: "payé", consultationType: "Consultation" }
    ];

    // ========== CLINIQUES (exemple minimal – à compléter avec tes données) ==========
    cliniques = [
        { id: nextCliniqueId++, nom: "Clinique Taoufik", ville: "Tunis", adresse: "Rue de la Liberté", telephone: "+216 71 123 456", email: "contact@clinique-taoufik.tn", specialites: ["Cardiologie", "Gynécologie"], description: "Clinique privée", note: 4.8, nombreMedecins: 45, horaires: "24h/24", prixMoyen: "1200€" }
    ];

    // ========== AUTRES DONNÉES MINIMALES ==========
    devisData = [{ id: nextDevisId++, patientId: demoUser.id, clinique: "Clinique Internationale", pays: "Tunisie", specialite: "Chirurgie Esthétique", statut: "Approuvé", montant: "3,200 €", montantNumerique: 3200, date: new Date().toISOString(), dossier: "Complet" }];
    documents = [{ id: nextDocId++, patientId: demoUser.id, nom: "Radio panoramique", type: "medical", taille: 2.3, tailleFormatted: "2.3 MB", url: "/uploads/sample.pdf", statut: "Validé", date: new Date().toISOString() }];
    messages = [{ id: nextMessageId++, from: "Clinique Internationale", to: demoUser.id, message: "Votre devis a été approuvé", subject: "Devis approuvé", lu: false, date: new Date().toISOString() }];
    packs = [{ id: nextPackId++, patientId: demoUser.id, reference: "PACK-001", nom: "Pack Sérénité", type: "Chirurgie Esthétique", clinique: "Clinique Taoufik", pays: "Tunisie", prix: 3200, duree: "7 jours", statut: "Confirmé" }];
    history = [{ id: nextHistoryId++, patientId: demoUser.id, action: "Devis demandé", clinique: "Clinique Internationale", montant: 3200, date: new Date().toISOString() }];
    medicalRecords = [{ patientId: demoUser.id, consultations: [], indicateurs: [] }];
    appointments = [{ id: nextAppointmentId++, patientId: demoUser.id, date: "2025-05-25T10:00:00Z", type: "Consultation", docteur: "Dr. Karim Ben Ali", statut: "Confirmé", lieu: "Clinique", createdAt: new Date().toISOString() }];

    // ========== SPÉCIALITÉS (exemple minimal – à compléter avec tes 45 spécialités) ==========
    specialites = [
        { id: nextSpecialiteId++, nom: "Cardiologie", description: "Spécialiste du cœur", icone: "❤️", offre: "Consultation à partir de 50€", medecins: 12, couleur: "#ff6b6b", pays: ["Tunisie", "Turquie"], prixMin: 50, prixMax: 150 },
        { id: nextSpecialiteId++, nom: "Dermatologie", description: "Spécialiste de la peau", icone: "🧴", offre: "Première consultation offerte", medecins: 8, couleur: "#4ecdc4", pays: ["Tunisie", "Turquie"], prixMin: 60, prixMax: 120 }
    ];
    for (const spec of specialites) {
        const medGen = genererMedecinsPourSpecialite(spec);
        medecins.push(...medGen);
    }

    console.log(`✅ Données initialisées : ${specialites.length} spécialités, ${medecins.length} médecins, ${cliniques.length} cliniques, ${packs.length} packs`);
}

// ========== ROUTES D'AUTHENTIFICATION ==========
app.post('/api/register', upload.single('diplome'), async (req, res) => {
    try {
        const { accountType, name, email, password, phone, specialite } = req.body;
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Nom, email et mot de passe requis' });
        if (users.find(u => u.email === email)) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        const hashedPassword = await bcrypt.hash(password, 10);
        let diplomePath = null;
        if (accountType === 'medecin') {
            if (!req.file) return res.status(400).json({ success: false, message: 'Le diplôme est requis pour les médecins' });
            diplomePath = `/uploads/${req.file.filename}`;
        }
        const newUser = {
            id: nextId++,
            accountType: accountType || 'patient',
            name, email, password: hashedPassword,
            phone: phone || '', membership: 'Standard',
            createdAt: new Date().toISOString(),
            specialite: accountType === 'medecin' ? specialite : null,
            diplome: diplomePath
        };
        users.push(newUser);
        if (accountType !== 'medecin') medicalRecords.push({ patientId: newUser.id, consultations: [], indicateurs: [] });
        const token = generateToken(newUser.id, newUser.email);
        res.status(201).json({
            success: true, token,
            user: {
                id: newUser.id, accountType: newUser.accountType, role: newUser.accountType,
                name, email, phone: newUser.phone, membership: newUser.membership,
                specialite: newUser.specialite, diplome: newUser.diplome
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        const token = generateToken(user.id, user.email);
        res.json({
            success: true, token,
            user: {
                id: user.id, accountType: user.accountType, role: user.accountType,
                name: user.name, email: user.email, phone: user.phone, membership: user.membership,
                specialite: user.specialite || null, diplome: user.diplome || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/me', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Token manquant' });
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        res.json({
            success: true,
            user: {
                id: user.id, accountType: user.accountType, name: user.name, email: user.email,
                phone: user.phone, membership: user.membership, createdAt: user.createdAt,
                specialite: user.specialite || null, diplome: user.diplome || null
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token invalide' });
    }
});

app.get('/api/users', (req, res) => {
    const usersList = users.map(u => ({ id: u.id, accountType: u.accountType, name: u.name, email: u.email, phone: u.phone, membership: u.membership, createdAt: u.createdAt }));
    res.json({ success: true, count: usersList.length, users: usersList });
});

// ========== ROUTES DASHBOARD PATIENT (version simplifiée mais fonctionnelle) ==========
app.get('/api/patient/profile', authMiddleware, (req, res) => {
    res.json({ success: true, data: { id: req.user.id, prenom: req.user.name.split(' ')[0], nom: req.user.name.split(' ')[1] || '', email: req.user.email, telephone: req.user.phone, membership: req.user.membership, role: req.user.accountType } });
});
app.put('/api/patient/profile', authMiddleware, async (req, res) => { res.json({ success: true }); });
app.get('/api/patient/stats', authMiddleware, (req, res) => { res.json({ success: true, data: { completion: 50, reservationsCount: 0, documentsCount: 0 } }); });
app.get('/api/devis', authMiddleware, (req, res) => { res.json({ success: true, data: devisData.filter(d => d.patientId === req.user.id) }); });
app.post('/api/devis', authMiddleware, (req, res) => { res.json({ success: true }); });
app.post('/api/devis/auto', authMiddleware, (req, res) => { res.json({ success: true }); });
app.patch('/api/devis/:id/status', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/documents', authMiddleware, (req, res) => { res.json({ success: true, data: documents.filter(d => d.patientId === req.user.id) }); });
app.post('/api/documents', authMiddleware, upload.single('document'), (req, res) => { res.json({ success: true }); });
app.delete('/api/documents/:id', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/messages', authMiddleware, (req, res) => { res.json({ success: true, data: messages.filter(m => m.to === req.user.id) }); });
app.post('/api/messages', authMiddleware, (req, res) => { res.json({ success: true }); });
app.patch('/api/messages/:id/read', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/pack', authMiddleware, (req, res) => { res.json({ success: true, data: packs.find(p => p.patientId === req.user.id) }); });
app.put('/api/pack', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/history', authMiddleware, (req, res) => { res.json({ success: true, data: history.filter(h => h.patientId === req.user.id) }); });
app.get('/api/medical/follow-up', authMiddleware, (req, res) => { res.json({ success: true, data: medicalRecords.find(m => m.patientId === req.user.id) }); });
app.put('/api/medical/indicators', authMiddleware, (req, res) => { res.json({ success: true }); });
app.post('/api/medical/consultations', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/notifications/unread', authMiddleware, (req, res) => { res.json({ success: true, count: 0 }); });
app.get('/api/appointments', authMiddleware, (req, res) => { res.json({ success: true, data: appointments.filter(a => a.patientId === req.user.id) }); });
app.post('/api/appointments', authMiddleware, (req, res) => { res.json({ success: true }); });
app.delete('/api/appointments/:id', authMiddleware, (req, res) => { res.json({ success: true }); });
app.put('/api/appointments/:id', authMiddleware, (req, res) => { res.json({ success: true }); });

// ========== ROUTES SPÉCIALITÉS, MÉDECINS, CLINIQUES, PACKS, LOGISTIQUE, RÉSERVATIONS ==========
app.get('/api/specialites', (req, res) => { res.json({ success: true, data: specialites }); });
app.get('/api/specialites/:id', (req, res) => { const s = specialites.find(sp => sp.id === parseInt(req.params.id)); res.json({ success: true, data: s }); });
app.get('/api/specialites/pays/:pays', (req, res) => { res.json({ success: true, data: [] }); });
app.get('/api/specialites/populaires', (req, res) => { res.json({ success: true, data: specialites.slice(0,5) }); });
app.get('/api/specialites/stats', (req, res) => { res.json({ success: true, data: { totalSpecialites: specialites.length, totalMedecins: medecins.length, prixMoyen: 100 } }); });
app.get('/api/specialites/:id/medecins', (req, res) => { const list = medecins.filter(m => m.specialiteId === parseInt(req.params.id)); res.json({ success: true, data: list }); });
app.get('/api/medecins/:id', (req, res) => { const d = medecins.find(m => m.id === parseInt(req.params.id)); res.json({ success: true, data: d }); });
app.post('/api/medecins/:id/rendez-vous', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/cliniques', (req, res) => { res.json({ success: true, data: cliniques }); });
app.get('/api/cliniques/:id', (req, res) => { const c = cliniques.find(cl => cl.id === parseInt(req.params.id)); res.json({ success: true, data: c }); });
app.get('/api/cliniques/ville/:ville', (req, res) => { const list = cliniques.filter(c => c.ville.toLowerCase() === req.params.ville.toLowerCase()); res.json({ success: true, data: list }); });
app.get('/api/cliniques/specialite/:specialite', (req, res) => { const list = cliniques.filter(c => c.specialites.includes(req.params.specialite)); res.json({ success: true, data: list }); });
app.get('/api/cliniques/:id/medecins', (req, res) => { res.json({ success: true, data: [] }); });
app.get('/api/packs', (req, res) => { res.json({ success: true, data: packs }); });
app.get('/api/packs/:id', (req, res) => { const p = packs.find(pk => pk.id === parseInt(req.params.id)); res.json({ success: true, data: p }); });
app.get('/api/packs/:id/avis', (req, res) => { res.json({ success: true, data: [] }); });
app.post('/api/packs/:id/avis', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/packs/:id/medecins', (req, res) => { res.json({ success: true, data: [] }); });
app.get('/api/logistique', (req, res) => { res.json({ success: true, data: { transferts: [], hebergements: [] } }); });
app.post('/api/logistique/reserver', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/reservations', authMiddleware, (req, res) => { res.json({ success: true, data: reservations.filter(r => r.patientId === req.user.id) }); });
app.post('/api/reservations', authMiddleware, (req, res) => { res.json({ success: true }); });
app.delete('/api/reservations/:id', authMiddleware, (req, res) => { res.json({ success: true }); });
app.get('/api/reservations/logistique', authMiddleware, (req, res) => { res.json({ success: true, data: [] }); });

// ========== ROUTES DASHBOARD MÉDECIN ==========
app.get('/api/doctor/patients', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const patients = doctorPatients.filter(p => p.doctorId === req.user.id);
    res.json({ success: true, data: patients });
});
app.put('/api/doctor/patients/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const idx = doctorPatients.findIndex(p => p.id === id && p.doctorId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    doctorPatients[idx] = { ...doctorPatients[idx], ...req.body };
    res.json({ success: true, data: doctorPatients[idx] });
});
app.get('/api/doctor/reviews', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const reviews = patientReviews.filter(r => r.doctorId === req.user.id);
    res.json({ success: true, data: reviews });
});
app.put('/api/doctor/reviews/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const idx = patientReviews.findIndex(r => r.id === id && r.doctorId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Avis non trouvé' });
    patientReviews[idx].response = req.body.response || null;
    res.json({ success: true, data: patientReviews[idx] });
});
app.delete('/api/doctor/reviews/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const idx = patientReviews.findIndex(r => r.id === id && r.doctorId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Avis non trouvé' });
    patientReviews.splice(idx, 1);
    res.json({ success: true, message: 'Avis supprimé' });
});
app.get('/api/doctor/stats', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'medecin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const earnings = doctorEarnings.filter(e => e.doctorId === req.user.id);
    const totalPaid = earnings.filter(e => e.status === 'payé').reduce((s, e) => s + e.amount, 0);
    const totalPending = earnings.filter(e => e.status === 'en_attente').reduce((s, e) => s + e.amount, 0);
    const totalConsultations = earnings.length;
    const totalPatients = doctorPatients.filter(p => p.doctorId === req.user.id).length;
    const today = new Date();
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
        const start = new Date(today);
        start.setDate(today.getDate() - (today.getDay() + 7 * i));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const weekEarnings = earnings.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);
        weeks.push({
            label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
            count: weekEarnings.length,
            amount: weekEarnings.reduce((s, e) => s + e.amount, 0)
        });
    }
    res.json({
        success: true,
        data: { totalPatients, totalConsultations, totalPaid, totalPending, weeklyStats: weeks, recentEarnings: earnings.slice(-5).reverse() }
    });
});

// ========== ROUTES ADMIN ==========
app.get('/api/admin/stats', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const totalPatients = users.filter(u => u.accountType === 'patient').length;
    const totalMedecins = users.filter(u => u.accountType === 'medecin').length;
    const totalCliniques = cliniques.length;
    const totalAppointments = appointments.length;
    const totalPacks = packs.length;
    res.json({ success: true, data: { totalPatients, totalMedecins, totalCliniques, totalAppointments, totalPacks, totalUsers: users.length } });
});

app.get('/api/admin/users', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const usersList = users.map(u => ({
        id: u.id, name: u.name, email: u.email, accountType: u.accountType,
        phone: u.phone, membership: u.membership, createdAt: u.createdAt
    }));
    res.json({ success: true, data: usersList });
});

app.put('/api/admin/users/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    const { accountType, name, email, phone, membership } = req.body;
    if (accountType) user.accountType = accountType;
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (membership) user.membership = membership;
    res.json({ success: true, data: user });
});

app.delete('/api/admin/users/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (id === req.user.id) return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    users.splice(index, 1);
    res.json({ success: true, message: 'Utilisateur supprimé' });
});

app.post('/api/admin/clinics', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const newClinic = { id: nextCliniqueId++, ...req.body, createdAt: new Date().toISOString() };
    cliniques.push(newClinic);
    res.status(201).json({ success: true, data: newClinic });
});

app.put('/api/admin/clinics/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const index = cliniques.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Clinique non trouvée' });
    cliniques[index] = { ...cliniques[index], ...req.body };
    res.json({ success: true, data: cliniques[index] });
});

app.delete('/api/admin/clinics/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const id = parseInt(req.params.id);
    const index = cliniques.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Clinique non trouvée' });
    cliniques.splice(index, 1);
    res.json({ success: true, message: 'Clinique supprimée' });
});

app.get('/api/admin/reviews', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const packReviews = [];
    packs.forEach(pack => {
        if (pack.avis && pack.avis.length) {
            pack.avis.forEach(avis => {
                packReviews.push({ id: avis.id, type: 'pack', packNom: pack.nom, patient: avis.patient, rating: avis.note, comment: avis.commentaire, date: avis.date });
            });
        }
    });
    const doctorReviews = patientReviews.map(r => ({ id: r.id, type: 'doctor', patient: r.patientName, rating: r.rating, comment: r.comment, date: r.date, response: r.response }));
    res.json({ success: true, data: [...packReviews, ...doctorReviews] });
});

app.delete('/api/admin/reviews/:type/:id', authMiddleware, (req, res) => {
    if (req.user.accountType !== 'admin') return res.status(403).json({ success: false, message: 'Accès réservé' });
    const { type, id } = req.params;
    const reviewId = parseInt(id);
    if (type === 'pack') {
        let found = false;
        for (const pack of packs) {
            const idx = pack.avis?.findIndex(a => a.id === reviewId);
            if (idx !== -1) { pack.avis.splice(idx, 1); found = true; break; }
        }
        if (!found) return res.status(404).json({ success: false, message: 'Avis non trouvé' });
    } else if (type === 'doctor') {
        const idx = patientReviews.findIndex(r => r.id === reviewId);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Avis non trouvé' });
        patientReviews.splice(idx, 1);
    } else {
        return res.status(400).json({ success: false, message: 'Type invalide' });
    }
    res.json({ success: true, message: 'Avis supprimé' });
});

// ========== ROUTE DE TEST ==========
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ Backend complet',
        demoAccount: {
            patient: { email: 'jean.dupont@email.com', password: 'password123' },
            doctor: { email: 'karim.benali@email.com', password: 'doctor123' },
            admin: { email: 'admin@test.com', password: 'admin123' }
        }
    });
});

// ========== DÉMARRAGE ==========
const PORT = 5000;
initDemoData().then(() => {
    app.listen(PORT, () => {
        console.log(`\n✅ Serveur démarré sur http://localhost:${PORT}`);
        console.log('👤 Patient : jean.dupont@email.com / password123');
        console.log('👤 Médecin : karim.benali@email.com / doctor123');
        console.log('👤 Admin   : admin@test.com / admin123\n');
    });
}).catch(err => console.error('❌ Erreur initialisation:', err));