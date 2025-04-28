const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with an environment variable for security

// Signup Route - No changes here
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Signup Debug: Hashed password being saved:', hashedPassword);

        // Save the user to the database
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Corrected Signin Route
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        console.log('Signin Debug: Retrieved user from DB:', user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials - user not found' });
        }

        console.log('Signin Debug: Plain password:', password);
        console.log('Signin Debug: Stored hashed password:', user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Signin Debug: Password match result:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials - password mismatch' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: { username: user.username, email: user.email },
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;