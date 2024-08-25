const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    total_price_set: {
        shop_money: {
            amount: {
                type: Number,
                required: true,
            },
        },
    },
    created_at: {
        type: Date,
        default: Date.now, // Set default to current date
    },
    // Add other fields with validation rules as necessary
});


const Order = mongoose.model('shopifyOrders', OrderSchema);
module.exports = Order;
