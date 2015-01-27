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
    refresh(req.user, process.env["KEY"], process.env["CS"], function (err) { 
      if (err) throw Error('Error with the refresh')
      var client = new Google(req.user.token) 
      client.getAll()
      .pipe(JSONStream.parse('items.*'))
      .pipe(es.map(function (data, callback) { 
        var obj = {}
        obj.id = data.id
        obj.title = data.title
        obj.type = data.mimeType
        callback(null,obj)
      }))
      .pipe(JSONStream.stringify())
      .pipe(res)
    })
  } else res.status(401).send('Invalid Credentials')
} 

module.exports.type = function (req, res) { 
  if (req.isAuthenticated()) {
    if (isValid(req.params.type)) {
      var regex = new RegExp(req.params.type, 'i')
      refresh(req.user, process.env["KEY"], process.env["CS"], function (err) { 
        var client = new Google(req.user.token)
        client.getAll()
        .pipe(JSONStream.parse('items.*'))
        .pipe(es.map(function (data, cb) { 
          if (regex.test(data.mimeType)) {
            var obj = {}
            obj.id = data.id
            obj.title = data.title
            obj.type = data.mimeType
            cb(null,obj)
          } else cb(null)
        })) 
        .pipe(JSONStream.stringify())
        .pipe(res)
      })
    } else res.status(400).send('Invalid file type')
  } else res.status(401).send('Invalid Credentials')
} 

function isValid (type) {
  if (type === 'spreadsheet'|| type === 'document') return true 
  else return false
}
