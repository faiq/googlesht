var base_uri = 'https://www.googleapis.com/drive/v2'
  , request = require('request')

function Google (token) {
  this.token = token
}

Google.prototype.getAll = function (next) { 
  var opts = 
  {
    uri: base_uri+'/files',
    headers: { 
      'Authorization': 'Bearer ' +  this.token
    }
  }
  return request(opts, next)
}

Google.prototype.getFile = function (id, next) { 
  var opts = 
  {
    uri: base_uri+'/files/' + id,
    headers: { 
      'Authorization': 'Bearer ' +  this.token
    }
  }
  return request(opts, next)
} 

module.exports = Google 
