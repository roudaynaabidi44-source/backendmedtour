const mongoose = require('mongoose');
const Specialite = require('./models/Specialite');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/medtour')
    .then(() => console.log('📦 Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur:', err));

// Liste des spécialités
const specialites = [
    {
        nom: "Cardiologie",
        description: "Spécialiste du cœur et des vaisseaux sanguins",
        icone: "❤️",
        offre: "Consultation à partir de 50€",
        medecins: 0,
        prixMin: 50,
        prixMax: 150,
        pays: ["Tunisie", "Turquie", "France"]
    },
    {
        nom: "Dermatologie",
        description: "Spécialiste de la peau, des cheveux et des ongles",
        icone: "🧴",
        offre: "Première consultation offerte",
        medecins: 0,
        prixMin: 60,
        prixMax: 120,
        pays: ["Tunisie", "Turquie", "Hongrie"]
    },
    {
        nom: "Pédiatrie",
        description: "Spécialiste des enfants et adolescents",
        icone: "👶",
        offre: "-20% sur le premier bilan",
        medecins: 0,
        prixMin: 40,
        prixMax: 100,
        pays: ["Tunisie", "Turquie", "France"]
    },
    {
        nom: "Ophtalmologie",
        description: "Spécialiste de la vision et des yeux",
        icone: "👓",
        offre: "Pack lunettes à partir de 100€",
        medecins: 0,
        prixMin: 80,
        prixMax: 300,
        pays: ["Turquie", "Tunisie"]
    },
    {
        nom: "Dentisterie",
        description: "Spécialiste des dents et de la bouche",
        icone: "🦷",
        offre: "Détartrage gratuit",
        medecins: 0,
        prixMin: 50,
        prixMax: 500,
        pays: ["Hongrie", "Turquie", "Tunisie"]
    },
    {
        nom: "Orthopédie",
        description: "Spécialiste des os et articulations",
        icone: "🦴",
        offre: "Consultation urgences 24h/24",
        medecins: 0,
        prixMin: 80,
        prixMax: 200,
        pays: ["Turquie", "Tunisie"]
    },
    {
        nom: "Gynécologie",
        description: "Spécialiste de la santé féminine",
        icone: "👩‍⚕️",
        offre: "Forfait suivi grossesse 200€",
        medecins: 0,
        prixMin: 70,
        prixMax: 200,
        pays: ["Tunisie", "Turquie"]
    },
    {
        nom: "Psychiatrie",
        description: "Spécialiste de la santé mentale",
        icone: "🧠",
        offre: "Premier entretien offert",
        medecins: 0,
        prixMin: 70,
        prixMax: 150,
        pays: ["Tunisie", "France"]
    },
    {
        nom: "ORL",
        description: "Spécialiste du nez, gorge et oreilles",
        icone: "👂",
        offre: "Bilan auditif gratuit",
        medecins: 0,
        prixMin: 60,
        prixMax: 120,
        pays: ["Tunisie", "Turquie"]
    },
    {
        nom: "Médecine Générale",
        description: "Médecin traitant",
        icone: "👨‍⚕️",
        offre: "Consultation à 25€",
        medecins: 0,
        prixMin: 25,
        prixMax: 50,
        pays: ["Tunisie", "Turquie", "France"]
    }
];

// Fonction pour insérer les données
async function seedSpecialites() {
    try {
        // Supprimer les anciennes spécialités
        await Specialite.deleteMany();
        console.log('🗑️ Anciennes spécialités supprimées');

        // Insérer les nouvelles
        await Specialite.insertMany(specialites);
        console.log(`✅ ${specialites.length} spécialités ajoutées avec succès !`);

        // Afficher la liste
        console.log('\n📋 Liste des spécialités :');
        specialites.forEach((spec, index) => {
            console.log(`   ${index + 1}. ${spec.nom} ${spec.icone}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécuter
seedSpecialites();