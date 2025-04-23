const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Auth = require("../middleware/isAuth");

router.post("/add", Auth, async (req, res) => {
    const { nom, prix, qte } = req.body;

    try {
        const product = new Product({ nom, prix, qte_stock: qte });
        await product.save();

        res.status(201).json({ message: "Product added successfully" });

    } catch (err) {
            return res.status(500).json({ message: "Error adding product", error: err.message });
    }
});

router.get("/show", Auth, async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/show/:nom", Auth, async (req, res) => {
    try {
        const { nom } = req.params;
        const product = await Product.findOne({"nom": nom});
        if (!product) {
            return res.status(404).json({ message: "Product makaynch" });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put("/update/:id", Auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.body.nom) product.nom = req.body.nom;
        if (req.body.prix) product.prix = req.body.prix;
        if (req.body.quantite) {
            // If quantite is negative, it's a deduction (for orders)
            if (req.body.quantite < 0) {
                product.qte_stock += req.body.quantite;
            } else {
                product.qte_stock = req.body.quantite;
            }
        }

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete("/delete/:id", Auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/search", Auth, async (req, res) => {
    try {
        const { minPrice, maxPrice, inStock } = req.query;
        let query = {};

        if (minPrice || maxPrice) {
            query.prix = {};
            if (minPrice) query.prix.$gte = Number(minPrice);
            if (maxPrice) query.prix.$lte = Number(maxPrice);
        }

        if (inStock === 'true') {
            query.qte_stock = { $gt: 0 };
        }

        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;