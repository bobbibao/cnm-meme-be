const jwt = require('jsonwebtoken');
const User = require('../models/User');
const express = require('express');
const bodyParser = require('body-parser');
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

const secretKey = 'cmn_meme_zalo_137167';

const app = express();
app.use(bodyParser.json());

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
};

const loginController = (req, res) => {
  const { username, password } = req.body;
  User.find()
  .then((users) => {
      const user = users.find(u => u.username === username && u.password === password);
      console.log(user);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.cookie('jwt', token, { httpOnly: true }); // save token in a httpOnly cookie
      res.json({ message: 'Login successful', token, redirectTo: '/chat' }); // send response to FE
    })
    .catch((err) => {
      return res.json(apiCode.error(err, "List All users Fail"));
    });
}

const getUserById = (req, res) => {
  const id = req.query.id;
  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({ message: 'Internal server error' });
    });
}

module.exports = {loginController, getUserById};