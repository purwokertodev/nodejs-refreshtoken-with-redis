var axios = require('axios');
var redis = require('redis');

const http = require('http');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('../config/passport');
const redisConf = require('../config/redis_config');

const db = require('../repo/user_repository');

const SECRET = 'secret';
const TOKENTIME = 120 * 60;

//redis
var client = redis.createClient(redisConf.port, redisConf.host, redisConf.auth);
// client.auth(redisConf.pass, function(err, reply){
//   if(err){
//     console.log('connection error'+err);
//   }
//   console.log('reply : '+reply)
// });

client.on('connect', function () {
    console.log("connnected to redis ");
});

// client.on('error',function(err){
//   console.error(err);
// });

var refreshTokenFromRandomString = function(length){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

module.exports = {
  serializeUser: function(req, res, next) {
    db.user.updateOrCreate(req.user, function(err, user) {
      if (err) {
        return next(err);
      }
      // we store information needed in token in req.user
      req.user = {
        id: user.id
      };
      next();
    });
  },

  serializeClient: function(req, res, next) {
    if (req.query.permanent === 'true') {
      db.client.updateOrCreate({
        user: req.user
      }, function(err, client) {
        if (err) {
          return next(err);
        }
        // we store information needed in token in req.user
        req.user.clientId = client.id;
        next();
      });
    } else {
      next();
    }
  },

  validateRefreshToken: function(req, res, next) {
    db.client.findUserOfToken(req.body, function(err, user) {
      if (err) {
        return next(err);
      }
      req.user = user;
      next();
    });
  },

  rejectToken: function(req, res, next) {
    db.client.rejectToken(req.body, next);
  },

  //////////////////////
  // token generation //
  //////////////////////
  generateAccessToken: function(req, res, next) {
    req.token = req.token ||  {};
    req.token.accessToken = jwt.sign({
      id: req.user.id,
      clientId: req.user.clientId
    }, SECRET, {
      expiresIn: TOKENTIME
    });
    next();
  },

  generateRefreshToken: function(req, res, next) {
    if (req.query.permanent === 'true') {
      req.token.refreshToken = req.user.clientId.toString() + '.' + refreshTokenFromRandomString(20);
      var id = req.user.clientId;
      var refreshToken = req.token.refreshToken;
      client.setex(id, 60, refreshToken);
      client.get(id, function(err, result){
        console.log(id+' = '+result);
      });
      next();
    } else {
      next();
    }
  },

  respond: {
    auth: function(req, res) {
      res.status(200).json({
        user: req.user,
        token: req.token
      });
    },
    token: function(req, res) {
      res.status(201).json({
        token: req.token
      });
    },
    reject: function(req, res){
      res.status(204).end();
    }
  }
};
