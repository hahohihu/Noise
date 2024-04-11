var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var randomstring = require('randomstring');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var accessRouter = require('./routes/access');
var displayRouter = require('./routes/display');

var app = express();

app.locals.randomState = randomstring.generate(16);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/access', accessRouter);
app.use('/display', displayRouter);

module.exports = app;
