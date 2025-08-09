const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        User.findOne({ email: email }).then(user => {
            if (!user) return done(null, false, { message: 'That email is not registered' });

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) return done(null, user);
                else return done(null, false, { message: 'Password incorrect' });
            });
        });
    }));

    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({ githubId: profile.id }).then(user => {
            if (user) return done(null, user);
            const newUser = new User({
                name: profile.displayName || profile.username,
                email: profile.emails ? profile.emails[0].value : `${profile.username}@github.com`,
                githubId: profile.id,
                password: null
            });
            newUser.save().then(user => done(null, user));
        });
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findById(id).then(user => done(null, user)).catch(done);
    });
};