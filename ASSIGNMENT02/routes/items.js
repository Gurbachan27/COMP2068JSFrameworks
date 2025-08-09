const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const nodemailer = require('nodemailer');
const { ensureAuth } = require('../middleware/auth');

router.get('/', async(req, res) => {
    const items = await Item.find().populate('user');
    res.render('items/list', { items });
});

router.get('/add', ensureAuth, (req, res) => res.render('items/add'));

router.post('/add', ensureAuth, async(req, res) => {
    const { title, description, type, location } = req.body;
    const newItem = new Item({ title, description, type, location, user: req.user.id });
    await newItem.save();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.user.email,
        subject: 'New Lost/Found Item Posted',
        text: `A new ${type} item "${title}" has been posted.`
    });

    req.flash('success_msg', 'Item added');
    res.redirect('/items');
});

router.get('/edit/:id', ensureAuth, async(req, res) => {
    const item = await Item.findById(req.params.id);
    res.render('items/edit', { item });
});

router.post('/edit/:id', ensureAuth, async(req, res) => {
    await Item.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success_msg', 'Item updated');
    res.redirect('/items');
});

router.get('/delete/:id', ensureAuth, async(req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Item deleted');
    res.redirect('/items');
});

module.exports = router;