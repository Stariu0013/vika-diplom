const express = require('express');
const Portfolio = require('../models/Portfolio');
const {PORTFOLIOS_ROUTE} = require("../consts"); // Middleware to verify login
const router = express.Router();

router.get(`/all`, async (req, res) => {
    try {
        const userId = req.userId; // The userId is attached to the request by the middleware
        const portfolios = await Portfolio.find({ userId }); // Fetch portfolios belonging to the authenticated user
        res.status(200).json(portfolios);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching portfolios' });
    }
});

router.post(`${PORTFOLIOS_ROUTE}`, async (req, res) => {
    const { portfolioName, wallet, type } = req.body;

    try {
        if (!portfolioName || wallet == null || !type) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const userId = req.userId; // Extract userId from the request object

        // Create new Portfolio object
        const newPortfolio = new Portfolio({
            portfolioName,
            wallet,
            type,
            id: Math.random().toString(36).substr(2, 10), // Generate a random unique ID
            userId, // Link the portfolio to the authenticated user
            actives: req.body.actives || [],
        });

        await newPortfolio.save(); // Save portfolio to the database
        res.status(201).json(newPortfolio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while creating portfolio' });
    }
});

// Delete a portfolio for the authenticated user
router.delete(`${PORTFOLIOS_ROUTE}/:id`, async (req, res) => {
    const portfolioId = req.params.id;

    try {
        const userId = req.userId;

        // Ensure portfolio belongs to the authenticated user
        const portfolio = await Portfolio.findOneAndDelete({ id: portfolioId, userId });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found or unauthorized' });
        }

        res.status(200).json({ message: 'Portfolio deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while deleting portfolio' });
    }
});

module.exports = router;
