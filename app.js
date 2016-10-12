var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var expressJwt = require('express-jwt');

var index = require('./routes/index');

var userRepo = require('./repo/user_repository');
var MyPassport = require('./config/passport');

var passport = new MyPassport(userRepo);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(responseTime());
app.use(passport.init());

const SECRET = 'secret';
var authenticate = expressJwt({
    secret:SECRET
});

app.get('/', function(req, res) {
  res.status(200).json({
    hello: 'world'
  });
});

app.post('/auth', passport.authenticate(), index.serializeUser, index.serializeClient, index.generateAccessToken,
  index.generateRefreshToken, index.respond.auth);


app.get('/me', authenticate, function(req, res) {
  res.status(200).json(req.user);
});

app.post('/token', index.validateRefreshToken, index.generateAccessToken, index.respond.token);
app.post('/token/reject', index.rejectToken, index.respond.reject);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
