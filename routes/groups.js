var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users')
const Group = require('../models/groups');

router.post('/findAllByUsername', function (req, res) {
  User.findOne({ token: req.body.token })
    .then((data) => {
      const userId = data.id
      Group.find({ members: userId })
        .populate({ path: 'festival', select: 'name' })
        .then((data) => {
          res.json({ result: true, groups: data })
        })
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
  User.findOne({ token: req.body.user })
    .then((data) => {
      Group.updateOne({ _id: req.body.groupId }, { $push: { members: data._id } })
        .then(() =>
          Group.findById(req.body.groupId)
            .then((data2) => {
              res.json({ result: true, updateMembers: data2 })
            }))
    })
})

router.delete('/deleteGroup', function (req, res) {
  Group.deleteOne({ name: req.body.name })
    .then(() => res.json({ result: true, message: 'Groupe supprimé' }));
})

router.put('/changeStatut', function (req, res) {
  User.findOne({ token: req.body.userToken })
    .then((user) => {
      if (user._id==req.body.userId){
        Group.updateOne({ _id: req.body.groupId }, { $pull: { [req.body.oldStatut]: req.body.userId } })
          .then(() => {
            Group.updateOne({ _id: req.body.groupId }, { $push: { [req.body.newStatut]: req.body.userId } })
              .then(() => {
                Group.findById(req.body.groupId)
                  .then((data) => {
                    res.json({ result: true, updateMembers: data })
                  })
              })
          })
      }
      else{
        res.json({ result: false })
      }
    })
})

router.post('/groupInfo', function (req, res) {
  Group.findById(req.body.groupId)
    .then((data) => {
      res.json({ result: true, groups: data })
    })
});

module.exports = router;