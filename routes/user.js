const express = require('express');

const { isLoggedIn, isNotLoggedIn} = require('./middlewares');
const User = require('../models/user');
const bcrypt = require("bcrypt");
const alert = require("alert");

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/followend', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (user) {
      await user.removeFollower(parseInt(req.user.id));
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/changnick', isLoggedIn, async (req, res, next) => {
  const { changNick } = req.body;
  console.log(changNick);

  try {
    const user = await User.findOne({ where: {id: req.user.id }});
    if (user) {
      await User.update({ nick: changNick }, { where: {id: req.user.id} });
      res.send("success");
    }
    else {
      res.status(404).send('no user');
    }
    return res.redirect('/');
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/findid', isNotLoggedIn, async (req, res, next) => {
  const { nickName } = req.body;
  try {
    const user = await User.findOne({ where: {nick: nickName }});
    if (user) {
      const find_email = user.email;
      alert(find_email);
      res.redirect('/editidpw');
    }
    else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/changpw', isLoggedIn, async (req, res, next) => {
  const { current_password, new_password, new_password_check } = req.body;

  try {
    const user = await User.findOne({ where: {id: req.user.id }});
    if (user) {
      const match = await bcrypt.compare(current_password, req.user.password);
      if (match) {
        const match2 = await bcrypt.compare(new_password, req.user.password);
        if (!match2) {
          if (new_password === new_password_check) {
            const hash = await bcrypt.hash(new_password, 12);
            await User.update({ password: hash }, {where: {id: req.user.id}});
            res.redirect('/auth/logout');
          }
          else {
            res.status(404).send('password current is wrong');
          }
        }
        else {
          res.status(404).send('password is not changed');
        }
      }
      else {
        res.status(404).send('own password is not correct');
      }
    }
    else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post('/:id/userdelete', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: {id: userId }});
    res.send("success")
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;