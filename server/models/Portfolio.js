const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    portfolioName: { type: String, required: true },
    wallet: { type: Number, required: true },
    type: { type: String, required: true },
    dateCreated: { type: Date, required: true },
    actives: { type: Array, default: [] },
    id: { type: String, unique: true, required: true },
    userId: { type: String, required: true }, // Ensure portfolios are user-specific
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
