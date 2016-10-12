var passport = require('passport');
var Strategy = require('passport-local');


var MyPassport = function(userRepo){
  this.userRepo = userRepo;
}

MyPassport.prototype = {
  init: function(){
    var self = this;
    var strategy = new Strategy(function(username, password, done){
      self.userRepo.user.authenticate(username, password, done);
    });

    passport.use(strategy);

    return passport.initialize();
  },

  authenticate: function() {
    return passport.authenticate(
    'local', {
      session: false,
      scope: []
    });
  }

};

module.exports = MyPassport;
