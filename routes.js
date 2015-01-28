var JSONStream = require('JSONStream')
  , es = require('event-stream')
  , refresh = require('./refresh')
  , Google = require('./fetchers/Google')
  , fs = require('fs')

module.exports.index = function (req, res) { 
  var html = fs.createReadStream(__dirname + "/views/index.html")
  html.on("error", function (err) {
    console.log(err)
  })
  html.pipe(res) 
}

module.exports.fail = function (req, res) { 
  res.send('fail')
}

module.exports.all = function (req, res) { 
  if (req.isAuthenticated()) {
    if (isValid(req.params.type)) {
      console.log(req.params.type)
      var regex
      if (req.params.type) regex = new RegExp(req.params.type)
      refresh(req.user, process.env["KEY"], process.env["CS"], function (err) { 
        if (err) throw Error('Error with the refresh')
        var client = new Google(req.user.token) 
        client.getAll()
        .pipe(JSONStream.parse('items.*'))
        .pipe(es.map(function (data, callback) { 
          if (regex && regex.test(data.mimeType)) 
            callback(null, buildObj(data.id, data.title, data.mimeType))
          else if (!regex)   
            callback(null, buildObj(data.id, data.title, data.mimeType))
          else if (regex && !regex.test(data.mimeType))
            callback(null)
          else 
            callback((new Error('The response from Google was wrong, or im dumb'))) //hopefullt im not stupid
        }))
        .on('error', function (err) { 
          res.status(500).send('Parsing your document type broke somehow') 
        })
        .pipe(JSONStream.stringify())
        .pipe(res)
      })
   } else res.status(400).send('Invalid file type')
  } else res.status(401).send('Invalid Credentials')
} 

//some utilities
function isValid (type) {
  if (!type) return true
  if (type === 'spreadsheet'|| type === 'document') return true 
  else return false
}

function buildObj (id, title, type) { 
  var obj = {}
  obj.id = id 
  obj.title = title
  obj.type = type 
  return obj
}
