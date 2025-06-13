var express = require('express');
var router = express.Router();

/* GET home page */
router.get('/', function(req, res) {
    res.render('home', { title: 'Home' });
});

/* GET about page */
router.get('/about', function(req, res) {
    res.render('about', { title: 'About Me' });
});

/* GET projects page */
router.get('/projects', function(req, res) {
    res.render('projects', { title: 'Projects' });
});

/* GET contact page */
router.get('/contact', function(req, res) {
    res.render('contact', { title: 'Contact Me' });
});

module.exports = router;