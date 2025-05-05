const express = require('express');
const verifyToken = require('../utils/verifyToken'); // Example path to middleware
const Portfolio = require('../models/Portfolio');

const router = express.Router();

router.use(verifyToken);

router.post('/create', async (req, res) => {
    const { portfolioName, wallet, type, actives } = req.body;

    try {
        const newPortfolio = new Portfolio({
            portfolioName,
            wallet,
            type,
            dateCreated: new Date(),
            actives: actives || [],
            id: Math.random().toString(36).substr(2, 10),
            userId: req.userId,
        });

        await newPortfolio.save();
        res.status(201).json(newPortfolio);
    } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({ message: 'Server error while creating portfolio' });
    }
});

// Get all portfolios for the authenticated user
router.get('/all', async (req, res) => {
    try {
        const portfolios = await Portfolio.find({ userId: req.userId });
        res.status(200).json(portfolios);
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        res.status(500).json({ message: 'Server error while fetching portfolios' });
    }
});

router.get('/:id', async (req, res) => {
    const portfolioId = req.params.id;

    try {
        const portfolio = await Portfolio.findOne({ id: portfolioId, userId: req.userId });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        res.status(200).json(portfolio);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error while fetching portfolio' });
    }
});

router.put('/update/:id', async (req, res) => {
    const portfolioId = req.params.id;
    const { portfolioName, wallet, type, actives } = req.body;

    try {
        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            { id: portfolioId, userId: req.userId },
            {
                portfolioName: portfolioName || undefined,
                wallet: wallet || undefined,
                type: type || undefined,
                actives: actives || undefined
            },
            { new: true, omitUndefined: true }
        );

        if (!updatedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        res.status(200).json(updatedPortfolio);
    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ message: 'Server error while updating portfolio' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const portfolioId = req.params.id;

    try {
        const portfolio = await Portfolio.findOneAndDelete({ id: portfolioId, userId: req.userId });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        res.status(200).json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        res.status(500).json({ message: 'Server error while deleting portfolio' });
    }
});

module.exports = router;