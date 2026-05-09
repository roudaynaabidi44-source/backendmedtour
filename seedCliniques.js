const mongoose = require('mongoose');
const Clinique = require('./models/Clinique');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/medtour')
    .then(() => console.log('📦 Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur:', err));

// Liste des cliniques
const cliniques = [
    {
        nom: "Clinique Taoufik",
        ville: "Tunis",
        adresse: "Boulevard Mohamed V, Tunis",
        telephone: "+216 71 123 456",
        email: "contact@cliniquetaoufik.tn",
        description: "Clinique privée multidisciplinaire de référence à Tunis.",
        specialites: ["Cardiologie", "Dermatologie", "Gynécologie"],
        note: 4.8,
        image: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg",
        prixConsultationMoyen: 80
    },
    {
        nom: "Clinique Hannibal",
        ville: "Tunis",
        adresse: "Rue du Lac Nord, Les Berges du Lac, Tunis",
        telephone: "+216 71 234 567",
        email: "contact@cliniquehannibal.tn",
        description: "Clinique haut de gamme avec équipements modernes.",
        specialites: ["Cardiologie", "Chirurgie Plastique", "Orthopédie"],
        note: 4.9,
        image: "https://images.pexels.com/photos/259984/pexels-photo-259984.jpeg",
        prixConsultationMoyen: 120
    },
    {
        nom: "Clinique La Marsa",
        ville: "La Marsa",
        adresse: "Avenue de la République, La Marsa",
        telephone: "+216 71 456 789",
        email: "contact@cliniquelamarsa.tn",
        description: "Clinique de prestige en banlieue nord de Tunis.",
        specialites: ["Dermatologie", "Chirurgie Esthétique", "Ophtalmologie"],
        note: 4.9,
        image: "https://images.pexels.com/photos/317440/pexels-photo-317440.jpeg",
        prixConsultationMoyen: 100
    },
    {
        nom: "Clinique L'Espoir",
        ville: "Sfax",
        adresse: "Route de l'Aéroport, Sfax",
        telephone: "+216 74 123 456",
        email: "contact@cliniqueespoir.tn",
        description: "Clinique réputée dans le sud tunisien.",
        specialites: ["Gynécologie", "Pédiatrie", "Cardiologie"],
        note: 4.7,
        image: "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg",
        prixConsultationMoyen: 70
    },
    {
        nom: "Clinique Internationale",
        ville: "Tunis",
        adresse: "Zone touristique, Gammarth, Tunis",
        telephone: "+216 71 567 890",
        email: "contact@cliniqueinternationale.tn",
        description: "Clinique spécialisée dans le tourisme médical.",
        specialites: ["Chirurgie Esthétique", "Dentisterie", "Ophtalmologie"],
        note: 4.8,
        image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
        prixConsultationMoyen: 150
    }
];

// Fonction pour insérer les données
async function seedCliniques() {
    try {
        // Supprimer les anciennes cliniques
        await Clinique.deleteMany();
        console.log('🗑️ Anciennes cliniques supprimées');

        // Insérer les nouvelles
        await Clinique.insertMany(cliniques);
        console.log(`✅ ${cliniques.length} cliniques ajoutées avec succès !`);

        // Afficher la liste
        console.log('\n📋 Liste des cliniques :');
        cliniques.forEach((clinique, index) => {
            console.log(`   ${index + 1}. ${clinique.nom} (${clinique.ville}) - ⭐ ${clinique.note}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécuter
seedCliniques();