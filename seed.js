// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/medtour')
    .then(() => console.log('📦 Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur:', err));

async function seedDatabase() {
    try {
        // Nettoyer les anciennes données
        await User.deleteMany();
        console.log('✅ Anciens utilisateurs supprimés');

        // Créer ADMIN
        const admin = new User({
            accountType: 'admin',
            name: 'Administrateur',
            email: 'admin@medtour.com',
            password: 'admin123',
            isActive: true
        });
        await admin.save();
        console.log('✅ Admin créé: admin@medtour.com / admin123');

        // Créer MÉDECIN
        const doctor = new User({
            accountType: 'medecin',
            name: 'Dr. Karim Ben Ali',
            email: 'karim.benali@email.com',
            password: 'doctor123',
            specialite: 'Cardiologie',
            isActive: true
        });
        await doctor.save();
        console.log('✅ Médecin créé: karim.benali@email.com / doctor123');

        // Créer PATIENT
        const patient = new User({
            accountType: 'patient',
            name: 'Jean Dupont',
            email: 'jean.dupont@email.com',
            password: 'patient123',
            phone: '+33 6 12 34 56 78',
            membership: 'Premium',
            isActive: true
        });
        await patient.save();
        console.log('✅ Patient créé: jean.dupont@email.com / patient123');

        console.log('\n🎉 Base de données initialisée avec succès !');
        console.log('\n📋 COMPTES DE TEST :');
        console.log('   👑 Admin   : admin@medtour.com / admin123');
        console.log('   👨‍⚕️ Médecin : karim.benali@email.com / doctor123');
        console.log('   👤 Patient : jean.dupont@email.com / patient123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seedDatabase();