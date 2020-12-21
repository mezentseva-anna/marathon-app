const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const Company = require('../models/company');
const Student = require('../models/student');

const saltRounds = 10;

router.post('/login', async (req, res, next) => {
  const {
    role, email, password,
  } = req.body;
  let user;
  if(role === 'company') {
    user = await Company.findOne({email}).populate({path: 'marathons', populate:{path: 'tasks', populate:{path: 'task', populate:{path: 'answers'}}}});
  } else {
    console.log('here')
    user = await Student.findOne({email}).populate({path: 'marathons', populate:{path: 'tasks', populate:{path: 'task', populate:{path: 'answers'}}}});
  }
  if (user && (await bcrypt.compare(password, user.password))) {
    // create session
    res.json({success: true, user});
  } if (user) {
    //wrong password
    res.json({success: false , message: 'wrong password'});
  } else {
    // no such user
    res.json({success: false , message: 'no such user'});
  }
});

router.post('/signup', async (req, res, next) => {
  const {
    role, username, email, password, tlg,
  } = req.body;
  let user;
  if (role === 'company') {
    const { company } = req.body;
    if (await Company.findOne({ username }) && await Company.findOne({ email })) {
      // already have such user
      res.json({success: false , message: 'have such user'})
    }
    user = await new Company({
      username,
      email,
      password: await bcrypt.hash(password, saltRounds),
      tlg,
      company,
      // role,
      marathons: [],
    }).populate({path: 'marathons', populate:{path: 'tasks', populate:{path: 'task', populate:{path: 'answers'}}}});
  } else {
    if (await Student.findOne({ username }) && await Student.findOne({ email })) {
      /// already have such user
      res.json({success: false , message: 'have such user'})
    }
    user = await new Student({
      username,
      email,
      password: await bcrypt.hash(password, saltRounds),
      tlg,
      // role,
      marathons: [],
    }).populate({path: 'marathons', populate:{path: 'tasks', populate:{path: 'task', populate:{path: 'answers'}}}});
  }

  await user.save();
  // create session
  res.json({success: true, user}).status(200)
});

module.exports = router;

