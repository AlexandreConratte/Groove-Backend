var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users')
const Group = require('../models/groups');

router.get('/findAllByUsername', function (req, res) {
  User.findOne({ token: req.body.token })
    .then(data => {
      const userId = data.id
      Group.find({ members: userId })
        .then(data => (res.json({ result: true, groups: data })))
    })
});

router.post('/newGroup', function (req, res) {
  Group.findOne({ name: req.body.name })
    .then(data => {
      if (data) {
        res.json({ result: false, message: 'Le groupe existe déjà' })
      }
      else {
        const newGroup = new Group({
          name: req.body.name,
          festival: req.body.festival,
          members: req.body.user
        });
        newGroup.save().then(data => {
          res.json({ result: true, group: data });
        });
      }
    })
})
router.put('/newUser', function (req, res) {
  Group.findOne({ name: req.body.name })
    .then(data => {
      const newUser = [...data.members, req.body.user]
      Group.updateOne({ name: req.body.name }, { members: newUser })
        .then(() => res.json({ result: true, message: 'Utilisateur ajouté' }))
    })
})

router.delete('/deleteGroup', function (req, res) {
  Group.deleteOne({ name: req.body.name })
    .then(() => res.json({ result: true, message: 'Groupe supprimé' }));
})
module.exports = router;