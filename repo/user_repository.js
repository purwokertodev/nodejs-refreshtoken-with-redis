'use strict'

module.exports = {
  user: {
    updateOrCreate: function(user, cb) {
      cb(null, user);
    },
    authenticate: function(username, password, cb) {
      if (username === 'wuriyanto' && password === '12345') {
        cb(null, {
          id: 666,
          firstname: 'wuriyanto',
          lastname: 'musobar',
          email: 'wuriyanto48@yahoo.co.id',
          verified: true
        });
      } else {
        cb(null, false);
      }
    }
  },
  client: {
    clients: [],
    clientCount: 0,
    updateOrCreate: function(data, cb) {
      let id = this.clientCount++;
      this.clients[id] = {
        id: id,
        userId: data.user.id
      };
      cb(null, {
        id: id
      });
    },
    storeToken: function(data, cb) {
      this.clients[data.id].refreshToken = data.refreshToken;
      cb();
    },
    findUserOfToken: function(data, cb) {
      if(!data.refreshToken){
        return cb(new Error('invalid token'));
      }
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].refreshToken === data.refreshToken) {
          return cb(null, {
            id: this.clients[i].userId,
            clientId: this.clients[i].id
          });
        }
      }
      cb(new Error('not found'));
    },
    rejectToken: function(data, cb){
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].refreshToken === data.refreshToken) {
          this.clients[i] = {};
          return cb();
        }
      }
      cb(new Error('not found'));
    }
  }

};
