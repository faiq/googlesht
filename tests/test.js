var nock = require('nock')
  , routes = require('../routes')
  , Stream = require('stream').PassThrough 
  , assert = require('assert') 
  , data = require('./mock') 

beforeEach(function (done) { 
  nock('https://www.googleapis.com').get('/drive/v2/files').reply(200, data) 
  done()
})

describe('hitting the all endpoint', function () { 
  it ('should respoond with an array with all my files with right credentials', function (done) { 
    var req = {}
      , res = new Stream 
      , buf = ''

    req.isAuthenticated = function () { return true }
    req.user = {}
    req.params = {}
    req.user.token = '123445abcd'
    res.on('data', function (chunk) {
      buf += chunk.toString()
    })
    res.on('end', function () { 
      buf = JSON.parse(buf) 
      assert.deepEqual(buf.length, 59)
      Array.prototype.forEach.call(buf, function (item) { 
        assert(item.title)
        assert(item.id) 
        assert(item.type) 
      }) 
      done()
    })
    routes.all(req, res)       
  }) 
  it ('should send an error when you\'re not authenticated', function (done) { 
    var req = {}
      , res = {}
    req.isAuthenticated = function () { return false }
    res.status = function (num) { 
      res.num = num
      return res
    } 
    res.send = function (message) { 
      res.message = message
      assert.deepEqual(res.message, 'Invalid Credentials')
      assert.deepEqual(res.num, 401)
      done()
    }
    routes.all(req,res)
  })
})


describe('hitting an /all/:item endpoint', function () {
  it ('should error if you aren\'t authenticated', function (done) { 
    var req = {}
      , res = {}
    req.isAuthenticated = function () { return false }
    res.status = function (num) { 
      res.num = num
      return res 
    } 
    res.send = function (message) { 
      res.message = message
      assert.deepEqual(res.message, 'Invalid Credentials')
      assert.deepEqual(res.num, 401)
      done()
    }
    routes.all(req,res)
  })
  it ('should error if you don\'t pass it in a valid param', function (done) { 
    var req = {}
      , res = {}
    req.isAuthenticated = function () { return true }
    req.user = {} 
    req.user.token = 'cool'
    req.params = {} 
    req.params.type = 'something not supported by google'  
    res.status = function (num) { 
      res.num = num
      return res
    } 
    res.send = function (message) { 
      res.message = message
      assert.deepEqual(res.message, 'Invalid file type')
      assert.deepEqual(res.num, 400)
      done()
    }
    routes.all(req,res)
  })
  it ('should give me all my spreadsheets if i pass in spreadsheets as a param', function (done) { 
    var req = {}
      , res = new Stream 
      , buf = ''

    req.isAuthenticated = function () { return true }
    req.user = {}
    req.user.token = '123445abcd'
    req.params = {} 
    req.params.type = 'document'  
    res.on('data', function (chunk) {
      buf += chunk.toString()
    })
    res.on('end', function () { 
      buf = JSON.parse(buf) 
      assert.deepEqual(buf.length, 33)
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

