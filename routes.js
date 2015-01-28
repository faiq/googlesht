var JSONStream = require('JSONStream')
  , es = require('event-stream')
  , refresh = require('./refresh')
  , Google = require('./fetchers/Google')
  , fs = require('fs')
  , validate = require('dash-chart-validation')


module.exports.index = function (req, res) { 
  var html = fs.createReadStream(__dirname + "/assets/views/index.html")
  html.on("error", function (err) {
    console.log(err)
  })
  html.pipe(res) 
}

module.exports.fail = function (req, res) { 
  res.send('fail')
}
//displays all files and all of a certain type of file
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
            callback(null, buildObj(data.id, data.title, data.mimeType, data.exportLinks))
          else if (!regex)   
            callback(null, buildObj(data.id, data.title, data.mimeType, data.exportLinks))
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

module.exports.files = function (req, res) {
  fs.createReadStream('./assets/views/files.html').pipe(res)
}

module.exports.id = function (req, res) {
  if (req.isAuthenticated()) {
    var client = new Google(req.user.token) 
    client.getFile(req.params.id, function (e, r, b) { 
      if (e) res.status(500).send('we had a problem getting your file')
      else { 
        var lines = req.body.split(/\r?\n/)
          , headers = lines[0].split(',')
          , result = {
              graph: {
                title: headers[0],
                datasequences: new Array(headers.length - 1)
              }
            }

        for (var j = 1; j < headers.length; j++) {
          result.graph.datasequences[j - 1] = {
          title: headers[j],
          datapoints: []
          }
        }

        for (var i = 1; i < lines.length; i++) {
          var line = lines[i].split(',')
          for (var k = 1; k < line.length; k++) {
            result.graph.datasequences[k - 1].datapoints.push({
              title: line[0],
              value:  parseFloat(line[k]) || null
            })
          }
        } 
        if (validate(result)) JSONStream.stringify.pipe(res)
        else res.status(400).send('Your file isnt the right type')
      }
    })
  } else res.status(401).send('Invalid Credentials')
}

//some utilities
function isValid (type) {
  if (!type) return true
  if (type === 'spreadsheet'|| type === 'document') return true 
  else return false
}

function buildObj (id, title, type, links) { 
  var obj = {}
  obj.id = id 
  obj.title = title
  obj.type = type 
  obj.links = links
  return obj
}
