const express = require('express');
const {default: yahooFinance} = require("yahoo-finance2");
const {STOCK_SYMBOLS} = require("../consts");
const router = express.Router();
const math = require('mathjs');
const numeric = require('numeric');

async function fetchStockHistory(symbol, interval = '1d') {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        const historicalData = await yahooFinance.historical(symbol, {
            period1: startDate,
            period2: endDate,
            interval: interval
        });

        const closingPrices = historicalData.map(data => data.close);
        const dailyReturns = closingPrices.slice(1).map((price, index) =>
            (price - closingPrices[index]) / closingPrices[index]
        );
        const expectedReturn = dailyReturns.reduce((sum, dailyReturn) => sum + dailyReturn, 0) / dailyReturns.length;
        const volatility = Math.sqrt(
            dailyReturns.reduce((sum, dailyReturn) => sum + Math.pow(dailyReturn - expectedReturn, 2), 0) / dailyReturns.length
        );
        const annualizedVolatility = volatility * Math.sqrt(252); // 252 trading days in a year
        let riskScore;

        if (annualizedVolatility < 0.15) {
            riskScore = "Low";
        } else if (annualizedVolatility < 0.25) {
            riskScore = "Medium";
        } else {
            riskScore = "High";
        }

        if (expectedReturn < -0.02) {
            riskScore = riskScore === "High" ? "Very High" : "High";
        }

        const lastFiveElements = historicalData.slice(-5).map(data => ({
            date: data.date,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: data.volume,
            expectedReturn: expectedReturn * 100,
            volatility,
            dailyReturns: dailyReturns.slice(-5),
            riskScore
        }));

        return {
            symbol,
            data: lastFiveElements
        };
    } catch (error) {
        console.error(`Error fetching historical data for ${symbol}:`, error);
        return {error: `Failed to fetch data for ${symbol}`};
    }
}

async function fetchSectorHistory(sector, interval = '1d') {
    try {
        const sectorSymbols = STOCK_SYMBOLS[sector];
        if (!sectorSymbols) {
            throw new Error(`Invalid sector: ${sector}`);
        }

        const results = {};
        for (const symbol of sectorSymbols) {
            results[symbol] = await fetchStockHistory(symbol, interval);
            // todo: remove this promise
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    } catch (error) {
        console.error('Error fetching sector history:', error);
        return {error: 'Failed to fetch sector history'};
    }
}

router.get('/sectors', (req, res) => {
    res.json(STOCK_SYMBOLS);
});

router.get('/:sector', (req, res) => {
    const sector = req.params.sector;
    if (!STOCK_SYMBOLS[sector]) {
        return res.status(404).json({error: 'Sector not found'});
    }

    fetchSectorHistory(sector).then(data => {
        res.json(data);
    })
});

router.post('/optimize', async (req, res) => {
    try {
        // Helper function to compute correlation coefficient
        function calculateCorrelation(arr1, arr2) {
            const len = arr1.length;
            const mean1 = math.mean(arr1);
            const mean2 = math.mean(arr2);
            const numerator = math.sum(arr1.map((val, i) => (val - mean1) * (arr2[i] - mean2)));
            const denominator = Math.sqrt(
                math.sum(arr1.map(val => Math.pow(val - mean1, 2))) *
                math.sum(arr2.map(val => Math.pow(val - mean2, 2)))
            );
            return numerator / denominator;
        }

        function convertArrayFormat(inputArray) {
            return inputArray.map(item => ({
                name: item.name,
                price: item.price,
                activeCount: item.activeCount,
                expectedReturn: item.expectedReturn,
                volatility: item.volatility,
                dailyReturns: Object.values(item.dailyReturns),
            }));
        }

        const stocks = convertArrayFormat(req.body.stocks);

        if (stocks.some(stock =>
            typeof stock.expectedReturn !== 'number' ||
            typeof stock.volatility !== 'number' ||
            typeof stock.price !== 'number' ||
            typeof stock.activeCount !== 'number'
        )) {
            return res.status(400).json({
                error: 'Invalid stock data: all numeric fields must be numbers'
            });
        }

        const targetReturn = parseFloat(req.body.targetReturn);

        if (!stocks || !targetReturn) {
            return res.status(400).json({ error: 'stocks and targetReturn are required' });
        }

        const n = stocks.length;
        const mu = stocks.map(stock => stock.expectedReturn);
        const sigma = stocks.map(stock => stock.volatility);

        // Extract daily returns
        const dailyReturns = stocks.map(stock => stock.dailyReturns);

        // Compute correlation matrix
        const corrMatrix = Array.from({length: n}, (_, i) =>
            Array.from({length: n}, (_, j) =>
                i === j ? 1 : calculateCorrelation(dailyReturns[i], dailyReturns[j])
            )
        );

        // Compute covariance matrix
        const covMatrix = corrMatrix.map((row, i) =>
            row.map((corrVal, j) => corrVal * sigma[i] * sigma[j])
        );

        // Calculate portfolio properties
        const currentValues = stocks.map(stock => stock.price * stock.activeCount);
        const portfolioValue = math.sum(currentValues);
        const initGuess = currentValues.map(val => val / portfolioValue);

        // Objective function: minimize portfolio variance
        function portfolioVariance(weights) {
            let sum = 0;
            for (let i = 0; i < weights.length; i++) {
                for (let j = 0; j < weights.length; j++) {
                    sum += weights[i] * weights[j] * covMatrix[i][j];
                }
            }
            return sum;
        }

        // Constraints
        function constraint1(weights) {
            return math.sum(weights) - 1;
        }

        function constraint2(weights) {
            return math.dot(mu, weights) - targetReturn;
        }

        function penalty(weights) {
            return Math.pow(constraint1(weights), 2) * 1e5 + Math.pow(constraint2(weights), 2) * 1e5;
        }

        function loss(weights) {
            return portfolioVariance(weights) + penalty(weights);
        }

        // Optimize
        const result = numeric.uncmin(loss, initGuess);
        const optWeights = result.solution;
        const finalReturn = math.dot(mu, optWeights);
        const finalVariance = portfolioVariance(optWeights);
        const finalStd = Math.sqrt(finalVariance);

        // Визначаємо діапазон цільової дохідності
        const minMu = Math.min(...mu); // Мінімальна очікувана дохідність активу
        const maxMu = Math.max(...mu); // Максимальна очікувана дохідність активу
        const tgtReturns = math.range(minMu, maxMu, (maxMu - minMu) / 50)._data;

        // Збираємо точки для ефективної межі та передаємо їх у відповідь
        const frontierRisks = [];
        for (const r of tgtReturns) {
            const frontierLoss = weights =>
                portfolioVariance(weights) +
                Math.pow(constraint1(weights), 2) * 1e5 +
                Math.pow(math.dot(mu, weights) - r, 2) * 1e5;

            const result = numeric.uncmin(frontierLoss, initGuess, 0.0001);
            if (result.solution) {
                frontierRisks.push({
                    return: r,
                    risk: Math.sqrt(portfolioVariance(result.solution))
                });
            }
        }

        res.json({
            success: true,
            initialWeights: stocks.map((stock, idx) => ({
                name: stock.name,
                weight: initGuess[idx]
            })),
            optimizedWeights: stocks.map((stock, idx) => ({
                name: stock.name,
                weight: optWeights[idx]
            })),
            portfolioValue,
            finalReturn,
            finalStd,
            frontier: frontierRisks
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: 'Internal Server Error during optimization' });
    }
});
module.exports = router;