var express = require('express');
var router = express.Router();
require('../models/connection');

const User = require('../models/users');


router.put('/mode', function (req, res) {
    const { token } = req.body;

    User.findOne({ token: token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'User not found' });
            }

            user.settings.nightMode = !user.settings.nightMode;

            user.save()
                .then(updatedUser => {
                    res.json({ result: true, nightMode: updatedUser.settings.nightMode });
                })
                .catch(error => {
                    res.json({ result: false, error: 'Error updating user' });
                });
        })
});


module.exports = router;