const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User'); // User model you will create
const bcrypt = require('bcrypt');

module.exports = function(passport) {

    // Local strategy
    passport.use(new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) return done(null, false, { message: 'Incorrect email or password.' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect email or password.' });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    // GitHub strategy
    passport.use(new GitHubStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/github/callback" // change in production
        },
        async(accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });
                if (!user) {
                    user = new User({
                        githubId: profile.id,
                        name: profile.displayName || profile.username,
                        email: (profile.emails && profile.emails[0].value) || '',
                        password: '' // no password for GitHub users
                    });
                    await user.save();
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }));

    // Serialize user to session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async(id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};