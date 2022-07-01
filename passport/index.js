const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => {    // 로그인 시 실행됨. req.session 객체에 어떤 데이터를 저장할지 정하는 메서드.
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {    // 매 요청 시 실행됨. passport.session 미들웨어가 이 메서드를 호출함.
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local();
  kakao();
};
