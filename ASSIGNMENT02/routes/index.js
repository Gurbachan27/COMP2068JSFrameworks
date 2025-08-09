const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Home / public list view (read-only)
router.get('/', async(req, res) => {
    try {
        const q = req.query.q || '';
        const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
        const items = await Item.find(filter).populate('foundBy', 'name').sort({ dateFound: -1 }).limit(50);
        res.render('index', { title: 'Lost & Found', items, q });
    } catch (err) {
        req.flash('error_msg', 'Unable to load items');
        res.render('index', { title: 'Lost & Found', items: [], q: '' });
    }
});

module.exports = router;