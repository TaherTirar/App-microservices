const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    produits: [{
        nom: {
            type: String,
            required: true
        },
        quantite: {
            type: Number,
            required: true
        },
        produitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }],
    email: {
        type: String,
        required: true
    },
    prix_total: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Commande', commandeSchema);
