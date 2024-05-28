require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var groupsRouter = require('./routes/groups');
var artistsRouter = require('./routes/artists');
var festivalsRouter = require('./routes/festivals');
var stylesRouter = require('./routes/styles');
var settingsRouter = require('./routes/settings');

var app = express();

const cors = require('cors');
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(cors());



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/festivals', festivalsRouter);
app.use('/artists', artistsRouter);
app.use('/groups', groupsRouter);
app.use('/styles', stylesRouter); 
app.use('/settings', settingsRouter);

module.exports = app;
