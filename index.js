var express = require("express")
  , http = require("http")
  , fs = require("fs") 
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , trace = require('long-stack-traces')
  , router = express()

router.use(session({secret: 'cat'}))
router.use(passport.initialize())
router.use(passport.session());
router.use(cookieParser())

passport.use(new goAuth({
  clientID: process.env["KEY"],
  clientSecret: process.env["CS"],
  callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function () { 
      return done(null, token) 
    })
  })
)

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

router.get("/auth/google", passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',"https://www.googleapis.com/auth/drive.file"]})) 

router.get("/auth/google/callback",passport.authenticate('google', { failureRedirect: '/fail',  successRedirect : '/pass' }))
     
router.get('/fail', function (req, res) { 
  res.send('fail')
}) 

router.get('/pass',  function (req, res) { 
  console.log(req.isAuthenticated())
  console.log(req.user)
  res.send('pass')
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
