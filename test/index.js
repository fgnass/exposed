var exposed = require('..')
  , express = require('express')
  , request = require('supertest')
  , concat = require('concat-stream')
  , should = require('should')
  , fs = require('fs')

var resources = exposed()

var app = express()
app.use('/mounted', resources)

resources.expose({ path: '/foo.txt', content: 'Foo' })
resources.expose({ path: '/hello.txt', root: __dirname })
resources.expose({ file: __dirname + '/foo.css', root: __dirname })
resources.expose({ file: __dirname + '/bar.txt', root: __dirname, content: 'boo' })
resources.expose({ path: '/pending', pending: true })

var zeros = new Array(1024).join(0)
resources.expose({ path: '/zip', content: zeros, gzip: true })

describe('expose string', function() {

  it('should iterate over all resources', function() {
    var all = []
    resources.each(function(res) {
      all.push(res)
    })
    all[0].path.should.equal('/foo.txt')
    all[1].path.should.equal('/hello.txt')
  })

  it('should lookup resources', function(done) {
    resources.get('/hello.txt').createReadStream().pipe(concat(function(s) {
      s.toString().should.equal('hello')
      done()
    }))
  })

  it('should know the mount point', function() {
    resources.get('/hello.txt').url.should.equal('/mounted/hello.txt')
  })

  it('should expose strings', function(done) {
    request(app)
      .get('/mounted/foo.txt')
      .expect(200, 'Foo')
      .end(done)
  })

  it('should report modifications', function(done) {
    resources.on('change', function(res) {
      done()
    })
    resources.expose({ path: '/foo', content: 'foo' })
    resources.expose({ path: '/foo', content: 'bar' })
  })

  it('should update resources', function(done) {
    request(app)
      .get('/mounted/pending')
      .expect(200, 'hello')
      .end(done)

    setTimeout(function() {
      resources.get('/pending').update('hello')
    }, 500)
  })

  it('should expose files', function(done) {
    request(app)
      .get('/mounted/hello.txt')
      .expect('content-type', 'text/plain')
      .expect(200, 'hello')
      .end(done)
  })

  it('should expose files with different content', function(done) {
    request(app)
      .get('/mounted/bar.txt')
      .expect('content-type', 'text/plain')
      .expect(200, 'boo')
      .end(done)
  })

  it('should expose streams', function(done) {
    var f = __dirname + '/hello.txt'
    resources.expose({path: '/stream', from: fs.createReadStream(f)})
    request(app)
      .get('/mounted/stream')
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
