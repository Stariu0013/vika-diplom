const express = require('express');
const verifyToken = require('../utils/verifyToken');
const Portfolio = require('../models/Portfolio');
   const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use(verifyToken);

router.delete('/:portfolioId/actives/delete/:activeId', async (req, res) => {
    const { portfolioId, activeId } = req.params;

    try {
        console.log('Deleting active...');
        console.log('Portfolio ID:', portfolioId);
        console.log('User ID:', req.userId);
        console.log('Active ID:', activeId);

        const portfolio = await Portfolio.findOne({ id: portfolioId, userId: req.userId });

        if (!portfolio) {
            console.log('Portfolio not found');
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        console.log('Portfolio found:', portfolio);
        console.log('Actives in portfolio:', portfolio.actives);

        // Log all active IDs for easier debugging
        const activeIDs = portfolio.actives.map((active) => active.id);
        console.log('Existing Active IDs:', activeIDs);

        const activeIndex = portfolio.actives.findIndex((active) => active.id === activeId);

        if (activeIndex === -1) {
            console.log(`Active with ID ${activeId} not found in portfolio ${portfolioId}`);
            return res.status(404).json({ message: 'Active not found' });
        }

        const active = portfolio.actives[activeIndex];

        if (!active.price || !active.activeCount || isNaN(active.price) || isNaN(active.activeCount)) {
            return res.status(400).json({ message: 'Invalid active data' });
        }

        const refundAmount = active.price * active.activeCount;
        portfolio.wallet += refundAmount;
        portfolio.actives.splice(activeIndex, 1);

        await portfolio.save();
        console.log(`Active ${activeId} deleted successfully. Refunded: $${refundAmount}`);

        return res.status(200).json({ message: 'Active deleted successfully', refunded: refundAmount });
    } catch (error) {
        console.error('Error deleting active:', error);
        return res.status(500).json({ message: 'Server error while deleting active' });
    }
});

router.post('/:portfolioId/actives/create', async (req, res) => {
    const { portfolioId } = req.params;
    const {
        activeCount,
        riskScore,
        volatility,
        name,
        price,
        dailyReturns,
        expectedReturn,
    } = req.body;

    try {
        console.log('Creating active...');
        console.log('Portfolio ID:', portfolioId);
        console.log('User ID:', req.userId);

        const portfolio = await Portfolio.findOne({ id: portfolioId, userId: req.userId });
        if (!portfolio) {
            console.log('Portfolio not found');
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        console.log('Actives before creation:', portfolio.actives);

        const activeCost = price * activeCount;
        portfolio.wallet = parseFloat(portfolio.wallet);

        if (portfolio.wallet < activeCost) {
            console.log('Insufficient funds in wallet');
            return res.status(400).json({ message: 'Insufficient funds in wallet' });
        }

        const newActive = {
            activeCount,
            riskScore,
            volatility,
            name,
            price,
            dailyReturns: dailyReturns || [],
            expectedReturn,
            id: uuidv4(),
        };
        console.log('New active:', newActive);

        portfolio.actives.push(newActive);
        portfolio.wallet -= activeCost;

        await portfolio.save();

        console.log('Actives after creation:', portfolio.actives);
        return res.status(201).json(newActive);
    } catch (error) {
        console.error('Error while creating active:', error);
        return res.status(500).json({ message: 'Server error while creating active' });
    }
});

router.get('/:portfolioId/actives', async (req, res) => {
    const { portfolioId } = req.params;

    try {
        const portfolio = await Portfolio.findOne({ id: portfolioId, userId: req.userId });

        if (!portfolio) {
            return res.status(404).json({ message: 'Portfolio not found or access denied' });
        }

        res.status(200).json(portfolio.actives);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching actives' });
    }
});

module.exports = router;