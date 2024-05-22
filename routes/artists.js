var express = require('express');
var router = express.Router();
require('../models/connection');

const Artist = require('../models/artists');

router.get('/findAll', function (req, res) {
  Artist.find()
    .then(data => (res.json({ result: true, artists: data })))
});

module.exports = router;