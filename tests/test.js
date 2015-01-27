var nock = require('nock')
  , Lab = require('lab')
  , routes = require('../routes')
  , Stream = require('stream').PassThrough 
  , assert = require('assert') 
  , data = require('./mock') 
  , lab = exports.lab = Lab.script() 
  , beforeEach = lab.beforeEach
  , describe = lab.describe
  , it = lab.it 

beforeEach(function (done) { 
  nock('https://www.googleapis.com').get('/drive/v2/files').reply(200, data) 
  done()
})

describe('hitting the all endpoint', function () { 
  it ('should respoond with an array with all my files', function (done) { 
    var req = {}
    req.isAuthenticated = function () { return true }
    req.user = {}
    req.user.token = '123445abcd'
    res = new Stream 
    var buf = ''
    res.on('data', function (chunk) {
      buf += chunk.toString()
    })
    res.on('end', function () { 
      buf = JSON.parse(buf) 
      assert(buf.length, 59)
      Array.prototype.forEach.call(buf, function (item) { 
        assert(item.title)
        assert(item.id) 
        assert(item.type) 
      }) 
      done()
    })
    routes.all(req, res)       
  }) 
})
