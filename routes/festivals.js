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
    .populate('artists')
    .then(data => (res.json({ result: true, festivals: data })))
});




router.post('/newFestival', async (req, res) => {
  for (let element of festivalsData) {
    let styles = [];
    let artists = [];

    for (let style of element.styles) {
      const data = await Style.findOne({ name: style })

      if (data === null) {
        const newStyle = new Style({
          name: style
        })
        const saveStyle = await newStyle.save()
        styles.push(saveStyle.id)
      }
      else {
        styles.push(data.id)
      }
    }

    for (let artist of element.artists) {
      const data = await Artist.findOne({ name: artist })

      if (data === null) {
        const newArtist = new Artist({
          name: artist
        })
        const saveArtist = await newArtist.save()
        artists.push(saveArtist.id)
      }
      else {
        artists.push(data.id)
      }
    }

    let [day, month, year] = element.start.split('/')
    const start = new Date(+year, +month - 1, +day)

    let [day2, month2, year2] = element.end.split('/')
    const end = new Date(+year2, +month2 - 1, +day2)

    const newFestival = new Festival({
      name: element.name,
      start: start,
      end: end,
      averageParticipant: element.averageParticipant,
      description: element.description,
      moreAbout: element.moreAbout,
      pictures: element.pictures,
      nbLikes: element.nbLikes,
      adress: element.adress,
      styles: styles,
      artists: artists,
    });
    newFestival.save()
  }
  res.json({ result: true })
})


module.exports = router;