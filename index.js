var express = require("express") 
  , http = require("http")
  , request = require("request")
  , fs = require("fs")
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy 
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , trace = require('long-stack-traces')
  , refresh = require('google-refresh-token')
  , JSONStream = require('JSONStream')
  , mongoose = require('mongoose')
  , Google = require('./fetchers/Google')
  , router = express()

mongoose.connect('mongodb://localhost/googleUsers')
var db = mongoose.connection
db.on('error', function (err) { 
  console.error(err)
}) 
db.once('open', function () { 
  console.log('yo')
  console.log('mongo in da house!')
})

var userSchema = mongoose.Schema({
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
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

passport.use(new goAuth({
  clientID: process.env["KEY"],
  clientSecret: process.env["CS"],
  callbackURL: "http://127.0.0.1:3000/auth/google/callback",
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',"https://www.googleapis.com/auth/drive"]
  },
  function(token, refreshToken, params, profile, done) {
    console.log('this is token ' + token)
    console.log('refresh ' + refreshToken)
    console.log('params ' + params)
    console.log('profile ' + profile)
    User.findOne({token: token}, function (err, user) { 
      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      if (err) { 
        console.log('errrrrrrrr')
        return done(err, null)
      } else if (!user) { 
        var now = + new Date
        var newUser = new User(
          { token: token, 
            refreshToken: refreshToken, 
            expirationDate: now + params.expires_in
          }
        )
        newUser.save(function (err, user) { 
          console.log('dafsadsfadfsadfs')
          if (err) {
            console.log('fuck'); 
            return done(err, null)
          }
          return done(null, newUser) 
          console.log('user not found')
        }) 
      } else {
        console.log('the user was already there hoe')
        return done(null, user)
      }
  }) 
}))


router.get("/auth/google", passport.authenticate('google', 
  { session: false,
    accessType: 'offline',
    approvalPrompt: 'force'})) 

router.get("/auth/google/callback",passport.authenticate('google', { failureRedirect: '/fail',  successRedirect : '/pass' }))
     
router.get('/fail', function (req, res) { 
  res.send('fail')
}) 

router.get('/pass',  function (req, res) { 
  var client = new Google(req.user) 
    , resArr = []
  console.log(req.user)
  client.getAll(function (e, r, b) { 
    b = JSON.parse(b)
    b.items.forEach(function (i) { 
      if (i["mimeType"] === 'application/vnd.google-apps.spreadsheet') { 
          resArr.push(i)
      } 
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
