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
router.post('/search', async (req, res) => {

  const { start, end, cityLongitude, cityLatitude, maxKm, style, artists, averageParticipant } = req.body;

  const filter = {};

  if (start && end) {
    filter.start = { $gte: start };
    filter.end = { $lte: end };
  } else if (start) {
    filter.start = { $gte: start }; // expected "start": "2024-07-16T22:00:00.000+00:00" 
  } else if (end) {
    filter.end = { $lte: end };
  }

  const promises = [];

  if (style && style.length > 0) {
    const styleIds = Style.find({ name: { $in: style } }).select('_id').exec(); //expected "style": ["Metal","Rock"]
    promises.push(styleIds.then(data => {
      const styleIdsArray = data.map(s => s._id);
      filter.styles = { $in: styleIdsArray };
    }));
  }

  if (artists && artists.length > 0) {
    const artistIds = Artist.find({ name: { $in: artists } }).select('_id').exec(); //expected "artists": ["Angèle"]
    promises.push(artistIds.then(data => {
      const artistIdsArray = data.map(a => a._id);
      filter.artists = { $in: artistIdsArray };
    }));
  }

  if (averageParticipant) {
    switch (averageParticipant) {
      case 'petit':
        filter.averageParticipant = { $lt: 10_000 };
        break;
      case 'moyen':
        filter.averageParticipant = { $gte: 10_000, $lte: 30_000 };
        break;
      case 'grand':
        filter.averageParticipant = { $gt: 30_000 };
        break;
      default:
        break;
    }
  }

  await Promise.all(promises);

  Festival.find(filter).populate('artists').populate('styles')
    .then(data => {
      if (data.length > 0) {

        if (cityLatitude && cityLongitude && maxKm) {
          const cityCoords = { latitude: cityLatitude, longitude: cityLongitude };
          const filteredFestivals = data.filter(festival => {
            const festivalCoords = { latitude: festival.adress.latitude, longitude: festival.adress.longitude };
            const distance = haversineDistance(cityCoords, festivalCoords);
            return distance <= maxKm;
          })
          if (filteredFestivals.length != 0) {
            return res.json({ result: true, festivals: filteredFestivals });
          } else {
            return res.json({ result: false, message: "no festival found in this range" });
          }
        } else {
          res.json({ result: true, festivals: data })
        }

      } else {
        res.json({ result: false, message: 'no results found' })
      }
    }
    )
})


router.post('/nbLikes', (req,res) => {
  const {festivalId} = req.body;

  Festival.findById(festivalId).then(festival => {
    if (!festival) {
      return res.json({ result: false, error: 'Festival not found' });
    }
    res.json({result: true, nbLike: festival.nbLikes.length})
  })
})


module.exports = router;