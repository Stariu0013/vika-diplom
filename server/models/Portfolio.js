const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    portfolioName: {
        type: String,
        required: true,
    },
    wallet: {
        type: Number,
        required: true,
        min: 0,
    },
    type: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    actives: {
        type: Array,
        default: [],
    },
    id: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User ID
        required: true,
        ref: 'User', // Assuming "User" is the name of your User model
    },
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
