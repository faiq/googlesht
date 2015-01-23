var express = require("express")
  , http = require("http")
  , request = require("request")
  , fs = require("fs")
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , JSONStream = require('JSONStream')
  , es = requrie('event-stream')
  , refresh = require('./refresh')
  , mongoose = require('mongoose')
  , Google = require('./fetchers/Google')
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
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
    },
    function(aToken, refreshToken, params, profile, done) {
      process.nextTick(function () { 
        User.findOne({id: profile.id}, function (err, user) {
          if (err) return done(err)
          else if (user) { 
            //we'll move the validation/refresh token stuff to api requests themselves 
            return done(null, user)
          } else { 
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


  router.get("/auth/google", passport.authenticate('google', 
    { 
      scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',"https://www.googleapis.com/auth/drive"],
      accessType: 'offline',
      approvalPrompt: 'force'
    })) 

  router.get("/auth/google/callback",passport.authenticate('google', {failureRedirect: '/fail',  successRedirect : '/pass' }))
       
  router.get('/fail', function (req, res) { 
    res.send('fail')
  }) 

  router.get('/pass',  function (req, res) { 
    refresh(req.user, process.env["KEY"], process.env["CS"], function (err) { 
        if (err) throw Error('Error with the refresh')
        var client = new Google(req.user.token) 
        , resArr = []
        client.getAll()
        .pipe(JSONStream.parse('items.*.exportLinks'))
        .pipe(es.map(function (data, callback) { 
          if (data['text/csv']) callback(null,data['text/csv'])
          else callback(null)
        }))
        .pipe(JSONStream.stringify())
        .pipe(res)
    })
  })

  router.get("/", function (req, res) { 
    console.log('hit index')
    var html = fs.createReadStream(__dirname + "/views/index.html")
    html.on("error", function (err) {
      console.log(err)
    })
    html.pipe(res) 
  })

  http.createServer(router).listen('3000', '127.0.0.1')
})
