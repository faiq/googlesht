var refresh = require('google-refresh-token')

module.exports = function (user, clientID, clientSecret, next) { 
  if (Math.floor((+ new Date)/1000) > user.expirationDate) { 
    refresh(user.refreshToken, clientID, clientSecret 
    , function (err, json, res) {
        if (err) return next (err) 
        else if (json.error) 
          throw Error(json.error)
        else {
          if (!json.accessToken) return next(err)
          user.token = json.accessToken;
          user.experationDate = Math.floor((+ new Date)/1000 + parseInt(json.expiresIn, 10))
          user.save(function (err) { 
            if (err) return next(err)
            return next()
          })
        }
    })
  } else next() 
}
