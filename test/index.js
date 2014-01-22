var exposed = require('..')
  , express = require('express')
  , request = require('supertest')
  , should = require('should')


var resources = exposed()
resources.expose({ path: '/foo.txt', content: 'Foo' })
resources.expose({ path: '/hello.txt', root: __dirname })
resources.expose({ file: __dirname + '/foo.css', root: __dirname })


var zeros = new Array(1024).join(0)
resources.expose({ path: '/zip', content: zeros, gzip: true })

var app = express()
app.use('/mounted', resources)

describe('expose string', function() {
  it('should expose strings', function(done) {
    request(app)
      .get('/mounted/foo.txt')
      .expect(200, 'Foo')
      .end(done)
  })

  it('should report modifications', function() {
    resources.expose({ path: '/foo', content: 'foo' }).dirty.should.be.ok
    resources.expose({ path: '/foo', content: 'foo' }).dirty.should.not.be.ok
    resources.expose({ path: '/foo', content: 'bar' }).dirty.should.be.ok
  })

  it('should expose files', function(done) {
    request(app)
      .get('/mounted/hello.txt')
      .expect('content-type', 'text/plain')
      .expect(200, 'hello')
      .end(done)
  })

  it('should lookup resources', function() {
    String(resources.get('/hello.txt')).should.equal('hello')
  })

  it('should iterate over all resources', function() {
    var all = []
    resources.each(function(res) {
      all.push(res)
    })
    all.length.should.equal(5)
    all[0].path.should.equal('/foo.txt')
    all[0].toString().should.equal('Foo')
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
