const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    // Define product fields here
    title: {
        type: String,
        required: true,
    },
    product_type: {
        type: String,
    },
    vendor: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    price: {
        type: Number,
    },

});

const Product = mongoose.model('shopifyProducts', ProductSchema);
module.exports = Product;
