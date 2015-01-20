module.exports = function (mongoose) {
  mongoose.connect('mongodb://localhost/googleUsers')
  var db = mongoose.connection
  db.on('error', function (err) { 
    console.error(err)
  }) 
  db.on('open', function () { 
    console.log('yo')
    console.log('mongo in da house!')
  })
  
  var userSchema = mongoose.Schema({
    token: String,
    refreshToken: String, 
    expirationDate: Number
  })
  , User = mongoose.model('user', userSchema)  
  return User
}
