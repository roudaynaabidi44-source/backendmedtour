const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/medtour');

async function seedActivity() {
    try {
        console.log('📦 Connexion à MongoDB...');
        
        // Nettoyer les anciennes données de test
        await User.deleteMany({ email: { $in: ['jean@test.com', 'sophie@test.com', 'pierre@test.com', 'contact@clinic.tn', 'contact@istanbul.com'] } });
        console.log('🗑️ Anciennes données supprimées');
        
        // Créer des patients
        const patients = [
            { name: 'Jean Martin', email: 'jean@test.com', password: await bcrypt.hash('123456', 10), accountType: 'patient', country: 'France', createdAt: new Date(Date.now() - 10 * 60 * 1000) },
            { name: 'Sophie Dubois', email: 'sophie@test.com', password: await bcrypt.hash('123456', 10), accountType: 'patient', country: 'Belgique', createdAt: new Date(Date.now() - 45 * 60 * 1000) },
            { name: 'Pierre Durand', email: 'pierre@test.com', password: await bcrypt.hash('123456', 10), accountType: 'patient', country: 'Suisse', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        ];
        
        for (const p of patients) {
            await User.create(p);
            console.log(`✅ Patient créé: ${p.name} (${p.email})`);
        }
        
        // Créer des cliniques en attente
        const clinics = [
            { name: 'Clinique Internationale Tunis', email: 'contact@clinic.tn', password: await bcrypt.hash('123456', 10), accountType: 'clinique', verified: false, country: 'Tunisie', certification: 'En attente' },
            { name: 'Istanbul Medical Center', email: 'contact@istanbul.com', password: await bcrypt.hash('123456', 10), accountType: 'clinique', verified: false, country: 'Turquie', certification: 'En attente' },
        ];
        
        for (const c of clinics) {
            await User.create(c);
            console.log(`✅ Clinique créée: ${c.name} (${c.email})`);
        }
        
        console.log('\n✅ Données de test ajoutées avec succès !');
        console.log('\n📋 Récapitulatif:');
        console.log('   - 3 patients');
        console.log('   - 2 cliniques en attente de validation');
        console.log('\n🔑 Tous les mots de passe sont: 123456');
        console.log('\n📧 Emails des cliniques en attente:');
        console.log('   - contact@clinic.tn');
        console.log('   - contact@istanbul.com');
        
        process.exit();
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

seedActivity();