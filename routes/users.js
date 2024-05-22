var express = require('express');
var router = express.Router();
require('../models/connection');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

const mailregex =  /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/

router.post('/signup', (req, res) => {
  if (!checkBody(req.body, ['username', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }
  User.findOne({ username: req.body.username , email : req.body.email}).then(data => {
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
      const optionalFields = ['firstname', 'lastname', 'birthdate', 'city', 'styles', 'artists', 'friends', 'likedFestivals', 'memoriesFestivals', 'picture']
      optionalFields.forEach(field => {
        if (req.body[field]) {
          userObligate[field] = req.body[field];
        }  
      });  
      console.log(userObligate)

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
      res.json({ result: true, username: data.username, token: data.token  });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});




module.exports = router;
