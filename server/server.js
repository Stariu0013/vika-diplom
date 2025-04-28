require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const portfolioRoutes = require('./routes/portfolio');
const {AUTH_ROUTE, STOCK_ROUTE, PORTFOLIOS_ROUTE} = require("./consts");
const { MONGODB_URL, PORT = 5000, SESSION_SECRET_KEY } = process.env;
const session = require('express-session');

function initializeMiddleware(app) {
    app.use(bodyParser.json());
    app.use(cors());
}

async function initializeDatabase() {
    if (!MONGODB_URL) {
        throw new Error('MONGODB_URL is not defined in environment variables');
    }

    try {
        await mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

const app = express();
initializeMiddleware(app);
initializeDatabase();

app.use(AUTH_ROUTE, authRoutes);
app.use(STOCK_ROUTE, stockRoutes);
app.use(PORTFOLIOS_ROUTE, portfolioRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

