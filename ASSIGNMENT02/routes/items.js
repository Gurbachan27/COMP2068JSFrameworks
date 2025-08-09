const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

function ensureAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/auth/login');
}

// List items (private - user's items)
router.get('/list', ensureAuth, async(req, res) => {
    try {
        const items = await Item.find({ foundBy: req.user._id }).sort({ dateFound: -1 });
        res.render('items/list', { items });
    } catch (err) {
        req.flash('error_msg', 'Cannot fetch your items');
        res.redirect('/');
    }
});

// Add item form
router.get('/add', ensureAuth, (req, res) => res.render('items/add'));

// Add item POST
router.post('/add', ensureAuth, async(req, res) => {
    const { name, description, location } = req.body;
    const errors = [];
    if (!name || !description) errors.push({ msg: 'Please include name and description' });
    if (errors.length) return res.render('items/add', { errors, name, description, location });

    try {
        await Item.create({ name, description, location, foundBy: req.user._id });
        req.flash('success_msg', 'Item added');
        res.redirect('/items/list');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to add item');
        res.redirect('/items/list');
    }
});

// Edit form
router.get('/edit/:id', ensureAuth, async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/items/list');
        }
        if (item.foundBy.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items/list');
        }
        res.render('items/edit', { item });
    } catch (err) {
        req.flash('error_msg', 'Error loading item');
        res.redirect('/items/list');
    }
});

// Update item
router.put('/edit/:id', ensureAuth, async(req, res) => {
    const { name, description, location } = req.body;
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/items/list');
        }
        if (item.foundBy.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items/list');
        }
        item.name = name;
        item.description = description;
        item.location = location;
        await item.save();
        req.flash('success_msg', 'Item updated');
        res.redirect('/items/list');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Update failed');
        res.redirect('/items/list');
    }
});

// Delete (confirmation handled client-side)
router.delete('/delete/:id', ensureAuth, async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/items/list');
        }
        if (item.foundBy.toString() !== req.user._id.toString()) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/items/list');
        }
        await item.deleteOne();
        req.flash('success_msg', 'Item deleted');
        res.redirect('/items/list');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Deletion failed');
        res.redirect('/items/list');
    }
});

module.exports = router;