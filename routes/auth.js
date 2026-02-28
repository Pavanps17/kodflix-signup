const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_here';

// --- Validation helper ---
const validateSignupDetails = (body) => {
    const { username, email, phone, password } = body;
    if (!username || !email || !phone || !password) {
        return 'All fields are required.';
    }
    if (password.length < 6) {
        return 'Password must be at least 6 characters long.';
    }
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format.';
    }
    return null;
};

// --- Registration (Signup) Endpoint ---
router.post('/signup', async (req, res) => {
    try {
        const errorMsg = validateSignupDetails(req.body);
        if (errorMsg) {
            return res.status(400).json({ error: errorMsg });
        }

        const { username, email, phone, password } = req.body;

        // Check if user exists
        const [existingUsers] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists.' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user to database
        // Automatically assigns role="user" due to DB default or explicit insertion
        await db.query(
            'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, phone, hashedPassword, 'user']
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error during registration.', details: error.message, stack: error.stack });
    }
});

// --- Login Endpoint ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Fetch user
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = users[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Generate JWT
        const payload = {
            sub: user.username,
            role: user.role
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '2h',
            algorithm: 'HS256'
        });

        res.status(200).json({
            message: 'login successfull',
            token
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login.', details: error.message, stack: error.stack });
    }
});

module.exports = router;
