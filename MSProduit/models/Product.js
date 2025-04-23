const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    nom: String,
    prix: Number,
    qte_stock: Number,
});

const Product = mongoose.model("produits", productSchema);
module.exports = Product;