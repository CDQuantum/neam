'use strict';

/**
 * Module dependencies.
 */


const local = require('./passport/local');

/**
 * 声明
 */

module.exports = function (passport) {

  // serialize sessions
  //passport.serializeUser((user, cb) => cb(null, user.id));
  //passport.deserializeUser((id, cb) => User.load({ criteria: { _id: id } }, cb));

  // use these strategies
  passport.use(local);
  /*passport.use(google);
  passport.use(facebook);
  passport.use(twitter);
  passport.use(linkedin);
  passport.use(github);*/
};
