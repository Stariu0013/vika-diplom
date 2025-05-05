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

let roundedPortfolioValueOutside;

router.post('/optimize', async (req, res) => {
    try {
        function calculateNormalizedWeights(weights) {
            // Normalize weights to sum strictly equals 1.0
            const total = math.sum(weights);
            return weights.map(w => w / total);
        }

        function calculateNewActiveCounts(stocks, weights, portfolioValue) {
            return stocks.map((stock, idx) => {
                const weight = weights[idx];
                // Skip if invalid weight or portfolio value
                if (!weight || weight <= 0 || portfolioValue <= 0) {
                    return {
                        ...stock,
                        activeCount: 0
                    };
                }

                // Compute active count based on portfolio value and stock price
                const newWeightValue = weight * portfolioValue;
                const newActiveCount = newWeightValue / stock.price;

                return {
                    ...stock,
                    activeCount: Math.max(0, Math.round(newActiveCount)), // Ensure valid rounding
                };
            });
        }

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

        function computeEfficientFrontier(stocks, numPoints = 50) {
            const n = stocks.length;
            const mu = stocks.map(stock => stock.expectedReturn);
            const sigma = stocks.map(stock => stock.volatility);

            // Compute covariance matrix
            const dailyReturns = stocks.map(stock => stock.dailyReturns);
            const corrMatrix = Array.from({length: n}, (_, i) =>
                Array.from({length: n}, (_, j) =>
                    i === j ? 1 : calculateCorrelation(dailyReturns[i], dailyReturns[j])
                )
            );
            const covMatrix = corrMatrix.map((row, i) =>
                row.map((corrVal, j) => corrVal * sigma[i] * sigma[j])
            );

            // Calculate minimum variance and maximum return portfolios
            const weights = [];
            const portfolioMetrics = [];
            for (let i = 0; i <= numPoints; i++) {
                const targetReturn = math.min(mu) + ((math.max(mu) - math.min(mu)) * i) / numPoints;

                // Define optimization function for target return
                function loss(weights) {
                    const sumPenalty = Math.pow(math.sum(weights) - 1, 2); // Enforce sum(weights) == 1
                    const returnPenalty = Math.pow(math.dot(mu, weights) - targetReturn, 2); // Enforce target return
                    const variance = weights.reduce((sum, wi, j) =>
                        sum + wi * weights.reduce((innerSum, wj, k) => innerSum + wj * covMatrix[j][k], 0), 0
                    );
                    return variance + sumPenalty * 1e6 + returnPenalty * 1e7; // Weight variance + penalties
                }

                // Optimize for the given target return
                const initialGuess = Array(n).fill(1 / n); // Equal weights as the initial guess
                const result = numeric.uncmin(loss, initialGuess).solution;
                const normalizedWeights = calculateNormalizedWeights(result);

                // Compute portfolio return and variance
                const portfolioReturn = math.dot(mu, normalizedWeights);
                const portfolioVariance = normalizedWeights.reduce((sum, wi, j) =>
                    sum + wi * normalizedWeights.reduce((innerSum, wj, k) => innerSum + wj * covMatrix[j][k], 0), 0
                );

                // Store results
                weights.push(normalizedWeights);
                portfolioMetrics.push({
                    return: portfolioReturn,
                    risk: Math.sqrt(portfolioVariance), // Standard deviation (risk)
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

        // Compute covariance matrix
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
            return math.dot(mu, weights) - targetReturn; // Enforces the expected portfolio return
        }

        function loss(weights) {
            return portfolioVariance(weights) + penalty(weights, mu, targetReturn);
        }

        // Core computation
        const result = numeric.uncmin(loss, initGuess);
        const optWeights = calculateNormalizedWeights(result.solution); // Normalized weights

        // Calculate final metrics
        const finalReturn = math.dot(mu, optWeights);
        const finalVariance = portfolioVariance(optWeights);

        // Compute efficient frontier
        const frontier = computeEfficientFrontier(stocks);

        // Validate result
        if (Math.abs(finalReturn - targetReturn) > 0.01) {
            console.warn(`Optimization result deviates from target. Final Return: ${finalReturn}, Target Return: ${targetReturn}`);
        }

        // Response
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
            finalStd: Math.sqrt(finalVariance),
            doughnutChartData: calculateAdjustedActiveCounts(stocks, optWeights, portfolioValue),
            frontier // Add efficient frontier as part of the response
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({error: 'Internal Server Error during optimization'});
    }
});

function calculateAdjustedActiveCounts(stocks, weights, portfolioValue, minWeight = 0.01) {
    // Ensure normalized weights sum up to 1
    function calculateNormalizedWeights(weights) {
        const total = math.sum(weights);
        if (total === 0) {
            return weights.map(() => 1 / weights.length); // Handle edge case
        }
        return weights.map(w => w / total);
    }

    // Adjust weights to enforce a minimum weight constraint
    const adjustedWeights = weights.map(w => Math.max(w, minWeight)); // Prevent weights close to 0
    const scaledWeights = calculateNormalizedWeights(adjustedWeights); // Normalize weights to sum to 1

    // Compute active counts before rounding
    let activeCounts = stocks.map((stock, idx) => {
        const weight = scaledWeights[idx];
        const weightedValue = weight * portfolioValue;
        return weightedValue / stock.price; // Pre-rounded active count
    });

    // Round active counts to integers
    let roundedActiveCounts = activeCounts.map(count => Math.round(count));

    // Compute the portfolio value based on rounded active counts
    let roundedPortfolioValue = roundedActiveCounts.reduce(
        (sum, count, idx) => sum + count * stocks[idx].price, 0
    );

    roundedPortfolioValueOutside = roundedPortfolioValue;

    // Compute the residue to adjust for rounding discrepancies
    let residue = portfolioValue - roundedPortfolioValue;

    // Adjust for any remaining discrepancy in portfolio value caused by rounding
    if (Math.abs(residue) > 0.01) { // Adjust only if significant residue exists
        const adjustmentPriority = stocks.map((stock, idx) => ({
            idx,
            price: stock.price,
            impact: Math.abs(residue / stock.price) // Impact per adjustment
        })).sort((a, b) => b.impact - a.impact);

        for (const {idx} of adjustmentPriority) {
            if (Math.abs(residue) < stocks[idx].price) {
                break; // No adjustment needed if residue is smaller than stock price
            }
            // Determine whether to add or subtract to correct the residue
            const increment = Math.sign(residue);
            const adjustment = increment * stocks[idx].price;

            // Apply adjustment and update residue
            roundedActiveCounts[idx] += increment;
            residue -= adjustment;

            if (Math.abs(residue) < 0.01) {
                break; // Residue small enough, stop adjusting
            }
        }
    }

    // Return stocks with adjusted active counts
    return stocks.map((stock, idx) => ({
        ...stock,
        activeCount: Math.max(0, roundedActiveCounts[idx]) // Ensure active counts are not negative
    }));
}


function penalty(weights, mu, targetReturn) {
    const sumPenalty = Math.pow(math.sum(weights) - 1, 2); // Enforce sum(weights) == 1
    const returnPenalty = Math.pow(math.dot(mu, weights) - targetReturn, 2); // Enforce target return
    return sumPenalty * 1e6 + returnPenalty * 1e7; // Increase penalty coefficients
}

module.exports = router;