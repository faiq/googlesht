var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/googleUsers')
var db = mongoose.connection
db.on('error', function (err) { 
  console.error(err)
}) 

var userSchema = mongoose.Schema({
  token: String,
  refreshToken: String, 
  expirationDate: Number
})
  , User = mongoose.model('user', userSchema)  

module.exports = User 
