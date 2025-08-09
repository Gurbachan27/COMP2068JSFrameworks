const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// GET register
router.get('/register', (req, res) => res.render('auth/register'));

// POST register
router.post('/register', async(req, res) => {
    const { name, email, password, password2 } = req.body;
    const errors = [];

    if (!name || !email || !password || !password2) errors.push({ msg: 'Please fill in all fields' });
    if (password !== password2) errors.push({ msg: 'Passwords do not match' });
    if (password && password.length < 6) errors.push({ msg: 'Password should be at least 6 characters' });

    if (errors.length) {
        return res.render('auth/register', { errors, name, email });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            errors.push({ msg: 'Email already registered' });
            return res.render('auth/register', { errors, name, email });
        }

        const newUser = new User({ name, email });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();

        req.flash('success_msg', 'You are registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Registration error');
        res.redirect('/auth/register');
    }
});

// GET login
router.get('/login', (req, res) => res.render('auth/login'));

// POST login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/items/list',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// GitHub auth routes (if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
    router.get('/github/callback', passport.authenticate('github', {
        successRedirect: '/items/list',
        failureRedirect: '/auth/login'
    }));
}

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
});

module.exports = router;