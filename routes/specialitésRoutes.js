// ... après les routes des rendez-vous ...

// ========== ROUTES POUR LES SPÉCIALITÉS ==========
app.get('/api/specialites', (req, res) => {
    res.json({
        success: true,
        data: specialites,
        total: specialites.length
    });
});

app.get('/api/specialites/:id', (req, res) => {
    const specialite = specialites.find(s => s.id === parseInt(req.params.id));
    if (!specialite) {
        return res.status(404).json({ success: false, message: 'Spécialité non trouvée' });
    }
    res.json({ success: true, data: specialite });
});

app.get('/api/specialites/pays/:pays', (req, res) => {
    const resultats = specialites.filter(s => s.pays && s.pays.includes(req.params.pays));
    res.json({ success: true, data: resultats, total: resultats.length });
});

app.get('/api/specialites/populaires', (req, res) => {
    const populaires = [...specialites].sort((a, b) => b.medecins - a.medecins).slice(0, 5);
    res.json({ success: true, data: populaires });
});

app.get('/api/specialites/stats', (req, res) => {
    const totalMedecins = specialites.reduce((total, spec) => total + spec.medecins, 0);
    const paysUniques = [...new Set(specialites.flatMap(s => s.pays || []))];
    res.json({
        success: true,
        data: {
            totalSpecialites: specialites.length,
            totalMedecins: totalMedecins,
            paysDisponibles: paysUniques
        }
    });
});

// ========== ROUTE DE TEST ==========
app.get('/api/test', (req, res) => {
    // ... votre route test existante ...
});