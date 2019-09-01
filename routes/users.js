var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
let mongoose = require('../db_config')
let userModel = mongoose.model('User')
const HttpStatus = require('http-status-codes');
let auth = require('../auth')
let verifyToken = auth.verifyToken

secretKey = 'the_most_secure_secret_key_in_the_world'

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/check-auth', verifyToken, (req, res) => {
  res.status(200).send({ username: req.username })
})

router.post('/register', (req, res) => {

  let new_user = new userModel({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  })
  userModel.findOne({ username: req.body.username }).then(tempData => {
    if (!tempData) {
      new_user.save().then(data => {
        res.status(201).send({ message: 'Registered Successfully' })
      }).catch(error => {
        res.status(400).send({ message: 'Bad Request' })
      })
    } else {
      // Exists
      res.status(400).send({ message: 'Username exists' })
    }
  }).catch(error => {
    res.status(400).send({ message: 'Bad Request' })
  })
})

router.get('/user-details/:username', (req, res) => {
  userModel.findOne({ username: req.params.username }).then(data => {
    res.status(200).send(data)
  }).catch(error => {
    console.log(error)
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' })
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
        res.status(HttpStatus.OK).send(
          {
            message: 'Logged in',
            token, expiresIn: expiresIn,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            all: data
          }
        )
      })
    } else {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'Username or password is invalid' })
    }
  }).catch(error => {
    console.log(error)
    res.status(400).send({ message: 'Bad Request' })
  })
})




module.exports = router;
