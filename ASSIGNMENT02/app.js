const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const methodOverride = require('method-override');
require('dotenv').config();

const authRouter = require('./routes/auth');

const app = express();

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions with Mongo store
app.use(session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport-config')(passport);

// Routes
app.use('/', authRouter);

// Home page
app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    });
});

module.exports = app;