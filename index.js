var express = require("express")
  , http = require("http")
  , request = require("request")
  , fs = require("fs")
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , refresh = require('google-refresh-token')
  , JSONStream = require('JSONStream')
  , mongoose = require('mongoose')
  , Google = require('./fetchers/Google')
  , router = express()

mongoose.connection.on('error', function (err) {
      console.error(err)
})

mongoose.connection.on('open', function (err) {
    console.log('yo')
    console.log('mongo in da house!')
})

mongoose.connect('mongodb://localhost/googleUsers')

var userSchema = mongoose.Schema({
    id: String,
    token: String,
    refreshToken: String,
    expirationDate: Number
})
  , User = mongoose.model('user', userSchema)


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
  var client = new Google(req.user.token) 
    , resArr = []
  client.getAll(function (e, r, b) { 
    b = JSON.parse(b)
    console.log(b)
    b.items.forEach(function (i) { 
      if (i["mimeType"] === 'application/vnd.google-apps.spreadsheet') resArr.push(i)
    })
    res.send(resArr)
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
