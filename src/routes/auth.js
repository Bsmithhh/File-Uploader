const express = require('express');
const router = express.Router();
const passport = require('passport');
const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// GET /auth/login - Show login form
router.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error') });
});

// POST /auth/login - Process login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true
}));

// GET /auth/register - Show register form
router.get('/register', (req, res) => {
    res.render('register', { error: req.flash('error') });
});

// POST /auth/register - Process registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            }
        });

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed');
        res.redirect('/auth/register');
    }
});

// GET /auth/logout - Process logout (for links)
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// POST /auth/logout - Process logout (for forms)
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;