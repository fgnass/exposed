var exposed = require('..')
  , express = require('express')
  , request = require('supertest')
  , assert = require('assert')


var expose = exposed()
expose({ path: '/foo.txt', content: 'Foo' })
expose({ path: '/hello.txt', root: __dirname })
expose({ file: __dirname + '/foo.css', root: __dirname })


var zeros = new Array(1024).join(0)
expose({ path: '/zip', content: zeros, gzip: true })

var app = express()
app.use('/mounted', expose)

describe('expose string', function() {
  it('should expose strings', function(done) {
    request(app)
      .get('/mounted/foo.txt')
      .expect(200, 'Foo')
      .end(done)
  })

  it('should expose files', function(done) {
    request(app)
      .get('/mounted/hello.txt')
      .expect('content-type', 'text/plain')
      .expect(200, 'hello')
      .end(done)
  })

  it('should determine path based on root', function(done) {
    request(app)
      .get('/mounted/foo.css')
      .expect('content-type', 'text/css')
      .expect(200, '.foo { color: red }')
      .end(done)
  })

  it('should gzip data', function(done) {
    request(app)
      .get('/mounted/zip')
      .set('accept-encoding', 'gzip')
      .expect(200, zeros)
      .expect('content-encoding', 'gzip')
      .expect('content-length', '29')
      .end(done)
  })
})
