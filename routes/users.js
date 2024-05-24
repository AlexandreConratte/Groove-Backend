var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const Festival = require('../models/festivals');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const uniqid = require('uniqid');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

const mailregex = /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ username: req.body.username, email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      /* Création de userobligate, avec les champs obligatoires */
      const userObligate = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),
      };
      /* création d'une const optional, qui va chercher la présence ou non des champs optionnels, et les ajouter à userObligate*/
      const optionalFields = ['phone', 'firstname', 'lastname', 'birthdate', 'city', 'styles', 'artists', 'friends', 'likedFestivals', 'memoriesFestivals', 'picture']
      optionalFields.forEach(field => {
        if (req.body[field]) {
          userObligate[field] = req.body[field];
        }
      });
      // console.log(userObligate)

      /* création du new user avec les champs obligatoires + ceux opitonnels trouvés dans la const userObligate */
      const newUser = new User(userObligate);

      newUser.save().then(data => {

        res.json({ result: true, token: data.token });
      });
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  });
});


router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ username: req.body.username }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, username: data.username, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

router.post('/likeDislikeFestival', (req, res) => {
  const { festivalId, token } = req.body;

  User.findOne({ token: token }).then(user => {
    if (!user) {
      return res.json({ result: false, error: 'User not found' });
    }

    const index = user.likedFestivals.indexOf(festivalId);

    Festival.findById(festivalId).then(festival => {
      if (!festival) {
        return res.json({ result: false, error: 'Festival not found' });
      }

      if (index === -1) {
        // Festival pas dans la liste, on l'ajoute
        user.likedFestivals.push(festivalId);
        festival.nbLikes.push(token); // Ajoute le token à la nbLike
      } else {
        // Festival présent, on le retire
        user.likedFestivals.splice(index, 1);
        const tokenIndex = festival.nbLikes.indexOf(token);
        if (tokenIndex !== -1) {
          festival.nbLikes.splice(tokenIndex, 1); // Retire le token de nbLike
        }
      }

      Promise.all([user.save(), festival.save()]).then(() => {
        res.json({ result: true, message: 'Update successful', likedFestivals: user.likedFestivals });
      });
    });

  })
})

router.post('/findLiked', (req, res) => {
  const { token } = req.body;

  User.findOne({ token: token }).populate('likedFestivals')
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'User not found' });
      }

      res.json({ result: true, festivalsLiked: user.likedFestivals })

    })
})

router.post('/checkUser', (req, res) => {
  const { username } = req.body;
  User.findOne({ username })
  .then( data => {
    if (data) {
    res.json({ result: true, error: "User déjà existant" }); //verifie qu'il y a un utilisateur, ce qui nous coduit à l'erreur en screen connect2
  } else {
    res.json({ result: false });
  }
})
})

router.post('/checkMail', (req, res) => {
  const { email } = req.body;
  User.findOne({ email })
  .then( data => {
  if (data) {
    res.json({ result: true, error: "Mail déjà existant" });
  } else {
    res.json({ result: false });
  }
})
})

router.post('/MemFest', (req,res) => {
  const { festivalId, token } = req.body;
    
  User.findOne({ token: token }).then(user => {
    if (!user) {
      return res.json({ result: false, error: 'User not found' });
    } 

    const index = user.memoriesFestivals.indexOf(festivalId);

    if(index === -1) {
      user.memoriesFestivals.push(festivalId);
    } else {
      user.memoriesFestivals.splice(index, 1);
    }

    Promise.all([user.save()]).then(() => {
      res.json({ result: true, message: 'Update successful', memoriesFestivals: user.memoriesFestivals });
    });

  })
});

router.post('/findMemories', (req,res) => {
  const { token } = req.body;

  User.findOne({ token: token }).populate('memoriesFestivals')
  .then(user => {
    if(!user) {
      return res.json({ result: false, error: 'User not found' })
    }

    res.json({ result: true, memoriesFestivals: user.memoriesFestivals})
  })
});

router.post('/iprofil', (req,res) => {
  const { token } = req.body

  User.findOne({ token : token })
  .select('-_id -password -token -friends -likedFestivals -memoriesFestivals') // pour retires les champs dont on a pas besoin
  .populate('styles').populate('artists')
  .then(user => {
    if(!user) {
      return res.json({ result: false, error: 'User not found' })
    }

    res.json({ result: true, user})
  })
})

 router.post('/photo', async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);

  if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);

      fs.unlinkSync(photoPath);

      res.json({ result: true, url: resultCloudinary.secure_url });
  }

  else {
      res.json({ result: false, error: resultMove });
  }
 
});

router.put('/update', (req,res) => {
  const { token, username, email, firstname, lastname, phone, city, styles, artists } = req.body;

  let updatedFields = {};
  if (username) updatedFields.username = username;
  if (email) updatedFields.email = email;
  if (firstname) updatedFields.firstname = firstname;
  if (lastname) updatedFields.lastname = lastname;
  if (phone) updatedFields.phone = phone;
  if (city) updatedFields.city = city;
  if (styles) updatedFields.styles = styles; // 
  if (artists) updatedFields.artists = artists;

  User.findOneAndUpdate(
    { token: token },
    { $set: updatedFields },
    { new: true } // pour retourner le document mis à jour et non le document avant màj 
  ).select('-_id -password -token -friends -likedFestivals -memoriesFestivals')
  .populate('styles')
  .populate('artists')
  .then(user => {
    if (!user) {
      return res.json({ result: false, error: 'User not found' });
    }

    res.json({ result: true, user });
  })

})

module.exports = router;
