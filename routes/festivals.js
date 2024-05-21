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
});


//fonction pour calculer la distance entre deux points géographiques
const haversineDistance = (coords1, coords2) => {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  const R = 6371; 
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

//route pour cherche les fetivals en fonction des critères
router.get('/search', async (req,res) => {

    const { start, end, cityLongitude, cityLatitude, maxKm, style, artists, averageParticipant } = req.body;

    const filter = {};

    if (start && end) {
      filter.start = { $gte: new Date(start) };
      filter.end = { $lte: new Date(end) };
    } else if (start) {
        filter.start = { $gte: new Date(start) };
    } else if (end) {
        filter.end = { $lte: new Date(end) };
    }

    const promises = [];
    
    if (style && style.length > 0) {
      const styleIds = Style.find({ name: { $in: style } }).select('_id').exec();
      promises.push(styleIds.then(data => {
        const styleIdsArray = data.map(s => s._id);
        filter.styles = { $in: styleIdsArray };
      }));
    }

    if (artists && artists.length > 0) {
      const artistIds = Artist.find({ name: { $in: artists } }).select('_id').exec();
      promises.push(artistIds.then(data => {
        const artistIdsArray = data.map(a => a._id);
        filter.artists = { $in: artistIdsArray };
      }));
    }

    if (averageParticipant) {
      switch (averageParticipant) {
        case 'Petit < 5k':
          filter.averageParticipant = { $lt: 5000 };
          break;
        case 'Moyen':
          filter.averageParticipant = { $gte: 5000, $lte: 20000 };
          break;
        case 'Grand > 20k':
          filter.averageParticipant = { $gt: 20000 };
          break;
        default:
          break;
      }
    }

    await Promise.all(promises);

    Festival.find(filter).populate('artists').populate('styles')
    .then (data => {
      if (data.length > 0) {

        if (cityLatitude && cityLongitude && maxKm) {
          const cityCoords = { latitude: cityLatitude, longitude: cityLongitude} ; 
          const filteredFestivals = data.filter(festival => {
            const festivalCoords = { latitude: festival.adress.latitude, longitude: festival.adress.longitude };
            const distance = haversineDistance(cityCoords, festivalCoords);
            return distance <= maxKm;
          })
          if (filteredFestivals.length != 0){
            return res.json({result: true, festivals: filteredFestivals});
          } else {
            return res.json({result: false, message: "no festival found in this range"});
          }
        } else {
          res.json({result: true, festivals: data})
        }
        
      } else {
        res.json({result: false, message: 'no results found'})
      }
    }
    )
    
})


module.exports = router;