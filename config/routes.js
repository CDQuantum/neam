'use strict';

/*!
 * Module dependencies.
 */

// Note: We can require cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

const users = require('../app/controllers/users');
//const articles = require('../app/controllers/articles');
const home = require('../app/controllers/home');
const auth = require('../app/middlewares/authorization');

/**
 * 角色权限 Route middlewaresusers.js
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

/**
 * 声明 routes
 */

module.exports = function (app) {

  app.get('/index', home.index);
  app.get('/list', home.list);

  // user routes
  app.get('/login', users.login);
  //app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  //app.post('/users', users.create);
  //app.get('/users/:userId', users.show);


  app.param('userId', users.load);

  // article routes
  /*app.param('id', articles.load);
  app.get('/articles', articles.index);
  app.get('/articles/new', auth.requiresLogin, articles.new);
  app.post('/articles', auth.requiresLogin, articles.create);
  app.get('/articles/:id', articles.show);
  app.get('/articles/:id/edit', articleAuth, articles.edit);
  app.put('/articles/:id', articleAuth, articles.update);
  app.delete('/articles/:id', articleAuth, articles.destroy);*/

  // home route
  //app.get('/', articles.index);




  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).render('422', { error: err.stack });
      return;
    }

    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
