var express = require('express');
var router = express.Router();
require('../models/connection');

const Artist = require('../models/artists');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;