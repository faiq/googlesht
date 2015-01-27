var nock = require('nock')
  , Lab = require('lab')
  , assert = require('assert')
  , routes = require('../routes')
  , 
  , data = require('./mock') 
  , lab = exports.lab = Lab.script() 
  , beforeEach = lab.beforeEach
  , describe = lab.describe
  , it = lab.it 

beforeEach(function (done) { 
  nock('https://www.googleapis.com').get('/drive/v2/files').reply(200, data) 
})

describe('hitting the all endpoint', function () { 
  it ('should respoond with an array with all my files', function (done) { 
    var req = {}
    req.isAuthenticated = function () { return true }
    req.user.token = '123445abcd'
    routes.all(req, res)       
  }) 
})
