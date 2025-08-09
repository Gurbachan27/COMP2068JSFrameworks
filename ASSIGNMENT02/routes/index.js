const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Home / splash page
router.get('/', async(req, res, next) => {
    res.render('index', { title: 'Lost & Found' });
});

// public posts list (read-only) with search
router.get('/posts', async(req, res, next) => {
    try {
        const q = req.query.q ? req.query.q.trim() : '';
        let filter = {};
        if (q) {
            const regex = new RegExp(q, 'i');
            filter = { $or: [{ title: regex }, { description: regex }, { location: regex }] };
        }
        const posts = await Post.find(filter).populate('createdBy').sort({ createdAt: -1 }).limit(200);
        res.render('posts/list', { title: 'All Reports', posts, q });
    } catch (err) {
        next(err);
    }
});

module.exports = router;