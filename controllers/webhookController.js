const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_votre_cle');
const { getPayments, addHistory } = require('../data/demoData');

let payments = getPayments();
let nextHistoryId = 1;

module.exports = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_votre_webhook_secret';
    
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.log(`⚠️ Webhook signature failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`✅ PaymentIntent réussi: ${paymentIntent.id}`);
            const paymentRecord = payments.find(p => p.stripePaymentIntentId === paymentIntent.id);
            if (paymentRecord) {
                paymentRecord.status = 'payé';
                paymentRecord.paidAt = new Date().toISOString();
                addHistory({
                    id: nextHistoryId++,
                    patientId: paymentRecord.patientId,
                    action: 'Paiement effectué',
                    clinique: paymentRecord.description,
                    montant: paymentRecord.amount,
                    details: `Paiement de ${paymentRecord.amount}€ via Stripe`,
                    date: new Date().toISOString()
                });
            }
            break;
        case 'payment_intent.payment_failed':
            const failedIntent = event.data.object;
            console.log(`❌ PaymentIntent échoué: ${failedIntent.id}`);
            const failedPayment = payments.find(p => p.stripePaymentIntentId === failedIntent.id);
            if (failedPayment) failedPayment.status = 'échoué';
            break;
        default:
            console.log(`Événement non traité: ${event.type}`);
    }
    
    res.json({ received: true });
};