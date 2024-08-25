const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    created_at: Date,
    default_address: {
        city: String,
    },
    // Add other fields as necessary
});

const Customer = mongoose.model('shopifyCustomers', CustomerSchema);
module.exports = Customer;
