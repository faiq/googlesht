var express = require("express")
  , http = require("http")
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , path = require('path')
  , mongoose = require('mongoose')
  , routes = require('./routes')
  , router = express()
  , User = null 

mongoose.connection.on('error', function (err) {
  process.exit(1) 
  console.error(err)
})

mongoose.connect('mongodb://localhost/googleUsers')

mongoose.connection.on('open', function (err) {
  console.log('mongo in da house')
  User = require('./models')(mongoose)

  router.use(session({secret: 'cat'}))
  router.use(passport.initialize())
  router.use(passport.session())
  router.use(cookieParser())
  router.use(express.static(path.join(__dirname, '/assets')))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({id: id}, function (err, user) {
      done(err, user)
    })
  })
  passport.use(new goAuth({
    clientID: process.env["KEY"],
    clientSecret: process.env["CS"],
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
    scope: ['profile', 'email','https://www.googleapis.com/auth/drive']
    },
    function(aToken, refreshToken, params, profile, done) {
      process.nextTick(function () {
        User.findOne({id: profile.id}, function (err, user) {
          if (err) return done(err)
          else if (user) return done(null, user)
          else {
            var newUser = new User()
            newUser.id = profile.id
            newUser.token = aToken
            newUser.refreshToken = refreshToken
            newUser.expirationDate = Math.floor((+ new Date)/1000 + params.expires_in)
            newUser.save(function(err) {
              if (err) throw err;
              return done(null, newUser);
            })
          }
        })
      })
    }
    )
  )

  router.get('/auth/google', passport.authenticate('google', { accessType: 'offline', approvalPrompt: 'force'}))
  router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/fail',  successRedirect : '/files' }))
  router.get('/fail', routes.fail) 
  router.get('/files', routes.files)
  router.get('/all',  routes.all)
  router.get('/all/:type', routes.all)
  router.get('/', routes.index)
  router.get('/:type/:id', routes.id)
  http.createServer(router).listen('3000', '127.0.0.1')
})

