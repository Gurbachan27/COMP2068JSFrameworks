const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const nodemailer = require('nodemailer');

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.flash('error', 'You must be logged in to do that.');
    return res.redirect('/login');
}

function ensureOwner(req, res, next) {
    Post.findById(req.params.id).then(post => {
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }
        if (String(post.createdBy) !== String(req.user._id)) {
            req.flash('error', 'Not authorized');
            return res.redirect('/posts');
        }
        res.locals.post = post;
        next();
    }).catch(next);
}

// helper: transporter
function createTransport() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    return nodemailer.createTransport({
        service: 'gmail', // or use SMTP provider details
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// create new post form
router.get('/new', ensureAuth, (req, res) => {
    res.render('posts/new', { title: 'Create Report' });
});

// create post (with validation)
router.post('/', ensureAuth, [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').trim().notEmpty().withMessage('Description required'),
    body('status').isIn(['lost', 'found']).withMessage('Status invalid')
], async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('posts/new', { title: 'Create Report', errors: errors.array(), formData: req.body });
    }
    try {
        const { title, description, location, status } = req.body;
        const post = new Post({ title, description, location, status, createdBy: req.user._id });
        await post.save();

        // send notification emails to users who have matching keywords
        const transporter = createTransport();
        if (transporter) {
            const allUsers = await User.find({ _id: { $ne: req.user._id }, keywords: { $exists: true, $ne: [] } });
            const textToMatch = `${title} ${description}`.toLowerCase();
            for (const u of allUsers) {
                for (const k of u.keywords || []) {
                    if (k && textToMatch.includes(k.toLowerCase())) {
                        // send email
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: u.email,
                            subject: `Lost&Found: New report matches "${k}"`,
                            text: `Hi ${u.name || 'User'},\n\nA new report titled "${title}" matches your watch keyword "${k}".\n\nView it here: ${process.env.BASE_URL || 'http://localhost:3000'}/posts/${post._id}\n\nRegards,\nLost&Found App`
                        };
                        transporter.sendMail(mailOptions).catch(err => console.error('Mail error', err));
                        break; // one email per user per post
                    }
                }
            }
        }

        req.flash('success', 'Report created.');
        res.redirect('/posts/' + post._id);
    } catch (err) {
        next(err);
    }
});

// show single post (public)
router.get('/:id', async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate('createdBy');
        if (!post) {
            req.flash('error', 'Post not found');
            return res.redirect('/posts');
        }
        res.render('posts/show', { title: post.title, post });
    } catch (err) {
        next(err);
    }
});

// my posts (private)
router.get('/my/list', ensureAuth, async(req, res, next) => {
    try {
        const posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.render('posts/list', { title: 'My Reports', posts, mine: true });
    } catch (err) {
        next(err);
    }
});

// edit form
router.get('/:id/edit', ensureAuth, ensureOwner, (req, res) => {
    const post = res.locals.post;
    res.render('posts/edit', { title: 'Edit Report', post });
});

// update
router.put('/:id', ensureAuth, ensureOwner, [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').trim().notEmpty().withMessage('Description required')
], async(req, res, next) => {
    const errors = validationResult(req);
    const post = res.locals.post;
    if (!errors.isEmpty()) {
        return res.render('posts/edit', { title: 'Edit Report', errors: errors.array(), post: Object.assign(post, req.body) });
    }
    try {
        post.title = req.body.title;
        post.description = req.body.description;
        post.location = req.body.location;
        post.status = req.body.status;
        await post.save();
        req.flash('success', 'Report updated');
        res.redirect('/posts/' + post._id);
    } catch (err) {
        next(err);
    }
});

// delete confirm page (GET)
router.get('/:id/delete', ensureAuth, ensureOwner, (req, res) => {
    const post = res.locals.post;
    res.render('posts/delete', { title: 'Confirm Delete', post });
});

// delete (DELETE)
router.delete('/:id', ensureAuth, ensureOwner, async(req, res, next) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        req.flash('success', 'Report deleted');
        res.redirect('/posts/my/list');
    } catch (err) {
        next(err);
    }
});

// PROFILE: view and update keywords
router.get('/profile', ensureAuth, async(req, res, next) => {
    res.render('profile', { title: 'Profile', user: req.user });
});
router.post('/profile/keywords', ensureAuth, async(req, res, next) => {
    try {
        // keywords coming as comma-separated
        const raw = (req.body.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
        req.user.keywords = raw;
        await req.user.save();
        req.flash('success', 'Keywords updated');
        res.redirect('/posts/profile');
    } catch (err) {
        next(err);
    }
});

module.exports = router;