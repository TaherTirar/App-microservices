const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande');
const { isAuth, isAdmin } = require('../middleware/isAuth');
const axios = require('axios');

router.post('/create', isAuth, async (req, res) => {
    try {
        const { produits } = req.body;
        const email = req.userData.email;
        let prix_total = 0;
        const validatedProducts = [];

        try {
            const productsResponse = await axios.get('http://localhost:5000/product/show', {
                headers: { 'Authorization': req.headers.authorization }
            });
            const availableProducts = productsResponse.data;
            for (const produit of produits) {
                if (!produit.nom || !produit.quantite) {
                    return res.status(400).json({ 
                        message: 'nom and qte'
                    });
                }
                const product = availableProducts.find(p => p.nom === produit.nom);
                if (!product) {
                    return res.status(404).json({ 
                        message: `Product ${produit.nom} not found` 
                    });
                }
                if (product.quantite < produit.quantite) {
                    return res.status(400).json({ 
                        message: `Insufficient quantity for ${produit.nom}. Available: ${product.quantite}`
                    });
                }
                prix_total += product.prix * produit.quantite;
                validatedProducts.push({
                    nom: produit.nom,
                    quantite: produit.quantite,
                    produitId: product._id
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error fetching product details', 
                error: error.message 
            });
        }
        const commande = new Commande({
            produits: validatedProducts,
            email,
            prix_total
        });
        await commande.save();
        try {
            for (const produit of validatedProducts) {
                await axios.put(`http://localhost:5000/product/update/${produit.produitId}`, 
                    { quantite: -produit.quantite },
                    { headers: { 'Authorization': req.headers.authorization } }
                );
            }
        } catch (error) {
            await Commande.findByIdAndDelete(commande._id);
            return res.status(500).json({ 
                message: 'Error updating product quantities', 
                error: error.message 
            });
        }
        res.status(201).json({ 
            message: 'Order created successfully',
            commande
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/show/:idCom', isAdmin, async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.idCom);
        if (!commande) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(commande);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/my-orders', isAuth, async (req, res) => {
    try {
        const orders = await Commande.find({ email: req.userData.email })
            .sort({ created_at: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/stats', isAdmin, async (req, res) => {
    try {
        const totalOrders = await Commande.countDocuments();
        const totalRevenue = await Commande.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$prix_total" }
                }
            }
        ]);

        const dailyStats = await Commande.aggregate([
            {
                $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$created_at" 
                        }
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$prix_total" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 7 }
        ]);

        res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            dailyStats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const order = await Commande.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await Commande.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
