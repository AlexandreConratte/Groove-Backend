var express = require('express');
var router = express.Router();
require('../models/connection');

const Style = require('../models/styles');


router.get('/findAll', function (req, res) {
  Style.find()
    .then(data => (res.json({ result: true, styles: data })))
});

module.exports = router;