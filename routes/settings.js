var express = require('express');
var router = express.Router();
require('../models/connection');

const User = require('../models/users');


router.put('/mode', function (req, res) {
    const { token, nightMode } = req.body;

    if (nightMode !== undefined && typeof nightMode !== 'boolean') {
        return res.json({ result: false, error: 'Invalid value for nightMode' });
    }

    User.findOne({ token: token })
        .then(user => {
            if (!user || !token) {
                return res.json({ result: false, error: 'User not found' });
            }

            // Si nightMode est défini et a une valeur valide, alors on met à jour la valeur dans la base de données
            if (nightMode !== undefined) {
                user.settings.nightMode = nightMode;
            }

            user.save()
                .then(updatedUser => {
                    res.json({ result: true, nightMode: updatedUser.settings.nightMode });
                })
        })
});


module.exports = router;