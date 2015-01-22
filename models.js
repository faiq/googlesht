module.exports = function (mongoose) { 
  var userSchema = mongoose.Schema({
      id: String,
      token: String,
      refreshToken: String,
      expirationDate: Number
  })
  , User = mongoose.model('user', userSchema)
  return User
} 
