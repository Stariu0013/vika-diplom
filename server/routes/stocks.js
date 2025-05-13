const express = require('express');
const {default: yahooFinance} = require("yahoo-finance2");
const {STOCK_SYMBOLS} = require("../consts");
const router = express.Router();
const math = require('mathjs');
const numeric = require('numeric');
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

async function fetchStockHistoryWithCache(symbol, interval = '1d') {
    const cacheKey = `${symbol}-${interval}`;
    const now = Date.now();
    if (cache.has(cacheKey)) {
        const {data, expires} = cache.get(cacheKey);
        if (expires > now) {
            return data;
        } else {
            cache.delete(cacheKey);
        }
    }
    const data = await fetchStockHistory(symbol, interval);
    cache.set(cacheKey, {data, expires: now + CACHE_TTL});
    return data;
}

async function fetchStockHistory(symbol, interval = '1d') {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        // Fetch historical data with retries
        const historicalData = await fetchWithRetry(() =>
            yahooFinance.historical(symbol, {
                period1: startDate,
                period2: endDate,
                interval
            })
        );

        // Validate response
        if (!historicalData || !Array.isArray(historicalData)) {
            throw new Error(`Invalid data received for symbol ${symbol}`);
        }

        if (historicalData.length === 0) {
            console.warn(`No historical data found for symbol ${symbol}`);
            return { symbol, data: [] }; // Return empty data if no history available
        }

        // Extract closing prices and calculate returns
        const closingPrices = historicalData
            .map(data => data?.close) // Validate close property
            .filter(price => price != null); // Filter invalid/missing data

        const dailyReturns = closingPrices.slice(1).map((price, index) =>
            (price - closingPrices[index]) / closingPrices[index]
        );

        // Calculate metrics
        const expectedReturn = dailyReturns.reduce((sum, dailyReturn) => sum + dailyReturn, 0) / dailyReturns.length;
        const volatility = Math.sqrt(
            dailyReturns.reduce((sum, dailyReturn) => sum + Math.pow(dailyReturn - expectedReturn, 2), 0) /
            dailyReturns.length
        );
        const annualizedVolatility = volatility * Math.sqrt(252);

        // Define risk score
        let riskScore = annualizedVolatility < 0.15 ? "Low" :
                        annualizedVolatility < 0.25 ? "Medium" : "High";

        if (expectedReturn < -0.02) {
            riskScore = riskScore === "High" ? "Very High" : "High";
        }

        // Process data with last 5 elements
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
        console.error(`Error fetching historical data for ${symbol}:`, error.message);
        return { error: `Failed to fetch data for ${symbol}` };
    }
}

async function fetchWithRetry(fetchFunction, retryCount = 3, delayMs = 1000) {
    for (let i = 0; i < retryCount; i++) {
        try {
            return await fetchFunction();
        } catch (error) {
            if (error.message.includes("Too Many Requests")) {
                await delay(delayMs);
            } else if (i < retryCount - 1) {
                await delay(delayMs);
            } else {
                throw error;
            }
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSectorHistory(sector, interval = '1d') {
    try {
        const sectorSymbols = STOCK_SYMBOLS[sector];
        if (!sectorSymbols) {
            throw new Error(`Invalid sector: ${sector}`);
        }
        const results = {};
        for (const symbol of sectorSymbols) {
            results[symbol] = await fetchStockHistoryWithCache(symbol, interval);
            await delay(150);
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
    });
});

let roundedPortfolioValueOutside;

router.post('/optimize', async (req, res) => {
    try {
        function normalizeWeights(weights) {
            const totalWeight = weights.reduce((sum, stock) => sum + stock.weight, 0);
            if (totalWeight === 0) {
                throw new Error("Total weight is zero, cannot normalize.");
            }
            return weights.map(stock => ({
                name: stock.name,
                weight: stock.weight / totalWeight
            }));
        }

        function calculateNormalizedWeights(weights) {
            const total = math.sum(weights);
            return weights.map(w => w / total);
        }

        function calculateNewActiveCounts(stocks, weights, portfolioValue) {
            return stocks.map((stock, idx) => {
                const weight = weights[idx];
                if (!weight || weight <= 0 || portfolioValue <= 0) {
                    return {
                        ...stock,
                        activeCount: 0
                    };
                }
                const newWeightValue = weight * portfolioValue;
                const newActiveCount = newWeightValue / stock.price;
                return {
                    ...stock,
                    activeCount: Math.max(0, Math.round(newActiveCount))
                };
            });
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

        function computeEfficientFrontier(stocks, numPoints = 50) {
            const n = stocks.length;
            const mu = stocks.map(stock => stock.expectedReturn);
            const sigma = stocks.map(stock => stock.volatility);
            const dailyReturns = stocks.map(stock => stock.dailyReturns);
            const corrMatrix = Array.from({length: n}, (_, i) =>
                Array.from({length: n}, (_, j) =>
                    i === j ? 1 : calculateCorrelation(dailyReturns[i], dailyReturns[j])
                )
            );
            const covMatrix = corrMatrix.map((row, i) =>
                row.map((corrVal, j) => corrVal * sigma[i] * sigma[j])
            );
            const weights = [];
            const portfolioMetrics = [];
            for (let i = 0; i <= numPoints; i++) {
                const targetReturn = math.min(mu) + ((math.max(mu) - math.min(mu)) * i) / numPoints;

                function loss(weights) {
                    const sumPenalty = Math.pow(math.sum(weights) - 1, 2);
                    const returnPenalty = Math.pow(math.dot(mu, weights) - targetReturn, 2);
                    const variance = weights.reduce((sum, wi, j) =>
                        sum + wi * weights.reduce((innerSum, wj, k) => innerSum + wj * covMatrix[j][k], 0), 0
                    );
                    return variance + sumPenalty * 1e6 + returnPenalty * 1e7;
                }

                const initialGuess = Array(n).fill(1 / n);
                const result = numeric.uncmin(loss, initialGuess).solution;
                const normalizedWeights = calculateNormalizedWeights(result);
                const portfolioReturn = math.dot(mu, normalizedWeights);
                const portfolioVariance = normalizedWeights.reduce((sum, wi, j) =>
                    sum + wi * normalizedWeights.reduce((innerSum, wj, k) => innerSum + wj * covMatrix[j][k], 0), 0
                );
                weights.push(normalizedWeights);
                portfolioMetrics.push({
                    return: portfolioReturn,
                    risk: Math.sqrt(portfolioVariance),
                });
            }
            return portfolioMetrics;
        }

        const stocks = convertArrayFormat(req.body.stocks);
        if (stocks.some(stock =>
            typeof stock.expectedReturn !== 'number' ||
            typeof stock.volatility !== 'number' ||
            typeof stock.price !== 'number' ||
            typeof stock.activeCount !== 'number'
        )) {
            return res.status(400).json({error: 'Invalid stock data: all fields must be numbers'});
        }
        const targetReturn = parseFloat(req.body.targetReturn || 0);
        if (!stocks || targetReturn === undefined) {
            return res.status(400).json({error: 'stocks and targetReturn are required'});
        }
        const n = stocks.length;
        const mu = stocks.map(stock => stock.expectedReturn);
        const sigma = stocks.map(stock => stock.volatility);
        const dailyReturns = stocks.map(stock => stock.dailyReturns);
        const corrMatrix = Array.from({length: n}, (_, i) =>
            Array.from({length: n}, (_, j) =>
                i === j ? 1 : calculateCorrelation(dailyReturns[i], dailyReturns[j])
            )
        );
        const covMatrix = corrMatrix.map((row, i) =>
            row.map((corrVal, j) => corrVal * sigma[i] * sigma[j])
        );
        const currentValues = stocks.map(stock => stock.price * stock.activeCount);
        const portfolioValue = math.sum(currentValues);
        const initGuess = currentValues.map(val => val / portfolioValue);

        function portfolioVariance(weights) {
            let sum = 0;
            for (let i = 0; i < weights.length; i++) {
                for (let j = 0; j < weights.length; j++) {
                    sum += weights[i] * weights[j] * covMatrix[i][j];
                }
            }
            return sum;
        }

        function constraint1(weights) {
            return math.sum(weights) - 1;
        }

        function constraint2(weights) {
            return math.dot(mu, weights) - targetReturn;
        }

        const loss = (weights) => {
            const variance = portfolioVariance(weights);
            const sumPenalty = Math.pow(math.sum(weights) - 1, 2);
            const returnPenalty = Math.pow(math.dot(mu, weights) - targetReturn, 2);
            return variance + sumPenalty * 1e6 + returnPenalty * 1e7;
        };
        const result = numeric.uncmin(loss, initGuess);
        const optWeights = calculateNormalizedWeights(result.solution);
        let optimizedWeights = stocks.map((stock, idx) => ({
            name: stock.name,
            weight: optWeights[idx] > 0 ? optWeights[idx] : 0.01
        }));
        optimizedWeights = normalizeWeights(optimizedWeights);
        const totalOptimizedWeight = optimizedWeights.reduce((sum, stock) => sum + stock.weight, 0);
        if (Math.abs(totalOptimizedWeight - 1) > 0.00001) {
        }
        const finalReturn = math.dot(mu, optWeights);
        const finalVariance = portfolioVariance(optWeights);
        const frontier = computeEfficientFrontier(stocks);
        if (Math.abs(finalReturn - targetReturn) > 0.01) {
        }
        res.json({
            success: true,
            initialWeights: stocks.map((stock, idx) => ({
                name: stock.name,
                weight: initGuess[idx]
            })),
            optimizedWeights,
            portfolioValue,
            finalReturn,
            finalStd: Math.sqrt(finalVariance),
            doughnutChartData: calculateAdjustedActiveCounts(stocks, optWeights, portfolioValue),
            frontier
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({error: 'Internal Server Error during optimization'});
    }
});

function calculateAdjustedActiveCounts(stocks, weights, portfolioValue, minWeight = 0.01) {
    function calculateNormalizedWeights(weights) {
        const total = math.sum(weights);
        return total === 0 ? weights.map(() => 1 / weights.length) : weights.map(w => w / total);
    }

    const adjustedWeights = weights.map(w => Math.max(w, minWeight));
    const scaledWeights = calculateNormalizedWeights(adjustedWeights);
    let activeCounts = stocks.map((stock, idx) => {
        const weight = scaledWeights[idx];
        const weightedValue = weight * portfolioValue;
        return weightedValue / stock.price;
    });
    let roundedActiveCounts = activeCounts.map(count => Math.round(count));
    let roundedPortfolioValue = roundedActiveCounts.reduce(
        (sum, count, idx) => sum + count * stocks[idx].price, 0
    );
    roundedPortfolioValueOutside = roundedPortfolioValue;
    let residue = portfolioValue - roundedPortfolioValue;
    if (Math.abs(residue) > 0.01) {
        const adjustmentPriority = stocks.map((stock, idx) => ({
            idx,
            price: stock.price,
            impact: Math.abs(residue / stock.price)
        })).sort((a, b) => b.impact - a.impact);
        for (const {idx} of adjustmentPriority) {
            if (Math.abs(residue) < stocks[idx].price) {
                break;
            }
            const increment = Math.sign(residue);
            const adjustment = increment * stocks[idx].price;
            roundedActiveCounts[idx] += increment;
            residue -= adjustment;
            if (Math.abs(residue) < 0.01) {
                break;
            }
        }
    }
    return stocks.map((stock, idx) => ({
        ...stock,
        activeCount: Math.max(0, roundedActiveCounts[idx])
    }))
}

function penalty(weights, mu, targetReturn) {
    const sumPenalty = Math.pow(math.sum(weights) - 1, 2);
    const returnPenalty = Math.pow(math.dot(mu, weights) - targetReturn, 2);
    return sumPenalty * 1e6 + returnPenalty * 1e7;
}

module.exports = router;