const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/auth/github',
    passport.authenticate('github'));

router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

module.exports = router;