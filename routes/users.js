var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
let mongoose = require('../db_config')
let userModel = mongoose.model('User')
const HttpStatus = require('http-status-codes');

secretKey = 'the_most_secure_secret_key_in_the_world'

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', (req, res) => {

  let new_user = new userModel({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  })

  new_user.save().then(data => {
    res.status(201).send({ message: 'Registered Successfully' })
  }).catch(error => {
    res.status(400).send({ message: 'Bad Request' })
  })
})

router.post('/login', (req, res) => {
  userModel.findOne({ username: req.body.username, password: req.body.password }).then(data => {
    if (data) {
      let expiresIn = ''
      if (req.body.rememberMe) {
        expiresIn = '1y'
      } else {
        expiresIn = '8h'
      }
      jwt.sign({ username: req.body.username, password: req.body.password }, secretKey, { expiresIn: expiresIn }, (error, token) => {
        if (error) {
          console.log(error)
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' })
        }
        res.status(HttpStatus.OK).send({ message: 'Logged in', token, expiresIn: expiresIn, username: data.username })
      })
    } else {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'Username or password is invalid' })
    }
  }).catch(error => {
    console.log(error)
    res.status(400).send({ message: 'Bad Request' })
  })
})

exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if (bearerHeader !== undefined) {
    const bearerToken = bearerHeader.split(' ')[1]
    jwt.verify(bearerToken, config.security.jwtSecretKey, (error, authData) => {
      if (error) {
        res.sendStatus(HttpStatus.FORBIDDEN)
      } else {
        req.username = authData.username
        next()
      }
    })
  } else {
    res.sendStatus(HttpStatus.FORBIDDEN)
  }
}


module.exports = router;
