var express = require('express');
var router = express.Router();
require('../models/connection');
const Festival = require('../models/festivals');
const festivalsData = require('../data/festivalsData.json')
const Style = require('../models/styles')
const Artist = require('../models/artists')

/* GET home page. */
router.get('/findAll', function (req, res) {
  Festival.find()
    .then(data => (res.json({ result: true, festivals: data })))
});




router.post('/newFestival', function (req, res) {
  festivalsData.forEach((element) => {
    Festival.findOne({ name: element.name })
      .then((data) => {
        if (!data) {
          let [day, month, year] = element.start.split('/')
          const start = new Date(+year, +month - 1, +day)

          let [day2, month2, year2] = element.end.split('/')
          const end = new Date(+year2, +month2 - 1, +day2)

          let styles = []
          let artists = []

          element.styles.forEach((style) => {
            Style.findOne({ name: style })
              .then(data => {
                if (data) {
                  styles.push(data.id)
                }
                else {
                  const newStyle = new Style({
                    name: style
                  })
                  newStyle.save()
                    .then(styles.push(newStyle.id))
                }
              })
          })

          const newFestival = new Festival({
            name: element.name,
            start: start,
            end: end,
            averageParticipant: element.averageParticipant,
            description: element.description,
            moreAbout: element.moreAbout,
            pictures: [],
            nbLikes: [],
            adress: element.adress,
            styles: styles,
            artists: artists,
          });

          newFestival.save().then(newDoc => {
            res.json({ result: true, token: newDoc.token });
          });
        }
        else {
          res.json({ result: false, message: 'festival already exist' })
        }
      })
  })
});

module.exports = router;