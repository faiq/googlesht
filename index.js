var express = require("express")
  , http = require("http")
  , fs = require("fs") 
  , passport = require("passport")
  , goAuth = require("passport-google-oauth").OAuthStrategy
  , session = require('express-session')
  , router = express()

router.use(session({secret: 'cat'}))

passport.use(new goAuth({
  consumerKey: process.env["KEY"],
  consumerSecret: process.env["CS"],
  callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(token, tokenSecret, profile, done) {
    console.log(token, tokenSecret, profile) 
    done()
  })
)

router.get("/auth/google", passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' })) 

router.get("/auth/google/callbback", passport.authenticate('google', {failureRedirect : '/'}, function (req, res) {
  res.send("success")
}))

router.get("/", function (req, res) { 
  console.log('hit index')
  var html = fs.createReadStream(__dirname + "/views/index.html")
  html.on("error", function (err) {
    console.log(err)
  })
  html.pipe(res) 
})

http.createServer(router).listen('3000', '127.0.0.1')
