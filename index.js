var express = require("express") 
  , http = require("http")
  , fs = require("fs")
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuth2Strategy 
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , trace = require('long-stack-traces')
  , refresh = require('google-refresh-token')
  , JSONStream = require('JSONStream')
  , User = require('./models/user')
  , Google = require('./fetchers/Google')
  , router = express()

router.use(session({secret: 'cat'}))
router.use(passport.initialize())
router.use(passport.session())
router.use(cookieParser())

passport.use(new goAuth({
  clientID: process.env["KEY"],
  clientSecret: process.env["CS"],
  callbackURL: "http://127.0.0.1:3000/auth/google/callback",
  scope: ['https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',"https://www.googleapis.com/auth/drive"]
  },
  function(token, refreshToken, params, profile, done) {
    //User.findOne({token: token}, function (err, user) { 
    //  if (err) { 
    //    console.log('errrrrrrrr')
    //    return done(err, user)
    //  } else if (!user) { 
    //    var now = + new Date
    //    var newUser = new User(
    //      { token: token, 
    //        refreshToken: refreshToken, 
    //        expirationDate: now + params.expires_in
    //      }
    //    )
    //    newUser.save(function (err, user) { 
    //      console.log('dafsadsfadfsadfs')
    //      if (err) {
    //        console.log('fuck'); 
    //        return console.error(err) 
    //      }
    //      return done(null, newUser) 
    //    }) 
    //    console.log('user not found')
    //  } else {
    //    console.log('the user was already there hoe')
    //  }
    //}) 
    return done(null, token)
  })
)

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

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
    , s = client.getAll()
  s.pipe(JSONStream.parse([true]))
   .pipe(res)
  s.on('error', console.error.bind(console))
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
