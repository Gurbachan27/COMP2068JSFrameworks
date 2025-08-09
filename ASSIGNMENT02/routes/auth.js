const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

router.get('/login', (req, res) => res.render('auth/login'));
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/auth/register');
    }
    User.findOne({ username }).then(user => {
        if (user) {
            req.flash('error_msg', 'Username already exists');
            res.redirect('/auth/register');
        } else {
            const newUser = new User({ username, email, password });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    newUser.password = hash;
                    newUser.save().then(() => {
                        req.flash('success_msg', 'You are registered!');
                        res.redirect('/auth/login');
                    });
                });
            });
        }
    });
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/items',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        req.flash('success_msg', 'Logged out');
        res.redirect('/auth/login');
    });
});

module.exports = router;