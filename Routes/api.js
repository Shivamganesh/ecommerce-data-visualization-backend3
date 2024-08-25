const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Customer = require('../models/customer');

// Total Sales Over Time
router.get('/api/sales-over-time', async (req, res) => {
    const interval = req.query.interval || 'daily';
    const groupBy = {
        daily: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
        monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
        quarterly: { $dateToString: { format: "%Y-Q", date: "$created_at" } },
        yearly: { $dateToString: { format: "%Y", date: "$created_at" } }
    }[interval];
    
    try {
        const sales = await Order.aggregate([
            { $group: { _id: groupBy, totalSales: { $sum: "$total_price_set.shop_money.amount" } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(sales);
    } catch (err) {
        res.status(500).send(err);
    }
});

// sales growth rate over time
router.get('/sales-growth-rate', async (req, res) => {
    try {
        const interval = req.query.interval || 'monthly';
        
        const groupBy = {
            monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
            yearly: { $dateToString: { format: "%Y", date: "$created_at" } }
        }[interval];

        const sales = await Order.aggregate([
            { $group: {
                _id: groupBy,
                totalSales: { $sum: "$total_price_set.shop_money.amount" }
            }},
            { $sort: { _id: 1 } }
        ]);

        const growthRate = sales.map((current, index, arr) => {
            if (index === 0) return { ...current, growthRate: 0 };
            const previous = arr[index - 1];
            const growthRate = ((current.totalSales - previous.totalSales) / previous.totalSales) * 100;
            return { ...current, growthRate };
        });

        res.json(growthRate);
    } catch (err) {
        res.status(500).send(err);
    }
});

//new customer added over time

router.get('/new-customers-over-time', async (req, res) => {
    try {
        const interval = req.query.interval || 'monthly';
        
        const groupBy = {
            monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
            yearly: { $dateToString: { format: "%Y", date: "$created_at" } }
        }[interval];

        const newCustomers = await Customer.aggregate([
            { $group: {
                _id: groupBy,
                newCustomers: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(newCustomers);
    } catch (err) {
        res.status(500).send(err);
    }
});

//number of repeat customers

router.get('/repeat-customers', async (req, res) => {
    try {
        const interval = req.query.interval || 'monthly';

        const groupBy = {
            monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
            yearly: { $dateToString: { format: "%Y", date: "$created_at" } }
        }[interval];

        const repeatCustomers = await Order.aggregate([
            { $group: {
                _id: "$customer_id",
                purchases: { $sum: 1 },
                firstPurchaseDate: { $first: "$created_at" }
            }},
            { $match: { purchases: { $gt: 1 } }},
            { $group: {
                _id: groupBy,
                repeatCustomers: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(repeatCustomers);
    } catch (err) {
        res.status(500).send(err);
    }
});

//geographical distribution of customer

router.get('/customer-distribution', async (req, res) => {
    try {
        const distribution = await Customer.aggregate([
            { $group: {
                _id: "$default_address.city",
                customers: { $sum: 1 }
            }},
            { $sort: { customers: -1 } }
        ]);

        res.json(distribution);
    } catch (err) {
        res.status(500).send(err);
    }
});

//Customer Lifetime Value by Cohorts

router.get('/customer-lifetime-value', async (req, res) => {
    try {
        const cohorts = await Customer.aggregate([
            { $lookup: {
                from: "shopifyOrders",
                localField: "_id",
                foreignField: "customer_id",
                as: "orders"
            }},
            { $unwind: "$orders" },
            { $group: {
                _id: { month: { $dateToString: { format: "%Y-%m", date: "$orders.created_at" } }, customer: "$_id" },
                totalSpent: { $sum: "$orders.total_price_set.shop_money.amount" }
            }},
            { $group: {
                _id: "$_id.month",
                cohortValue: { $avg: "$totalSpent" }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json(cohorts);
    } catch (err) {
        res.status(500).send(err);
    }
});

//



module.exports = router;
