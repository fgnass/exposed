var path = require('path')
  , mime = require('mime')
  , extname = path.extname

module.exports = Resource

function Resource(path, opts) {
  this.path = path
  this.maxAge = opts.maxAge || 0
  if (this.maxAge == Infinity) this.maxAge = 60 * 60 * 24 * 365 * 1000

  this.contentType = opts.contentType || mime.lookup(extname(path))
  this.contentEncoding = opts.contentEncoding

  this.lastModified = new Date()
}

Resource.prototype.serve = function(req, res) {

  function set(header, value) {
    if (value !== undefined) res.setHeader(header, value)
  }

  set('Date', new Date().toUTCString())

  // Conditional GET
  var since = req['if-modified-since']
  if (since) {
    if (this.lastModified <= new Date(since)) {
      res.statusCode = 304
      res.end()
      return
    }
  }

  // Gzip support
  if (this.gzip) {
    set('Vary', 'Accept-Encoding')
    if (/gzip/i.exec(req.headers['accept-encoding'])) {
      return this.gzip.serve(req, res)
    }
  }

  set('Content-Type', this.contentType)
  set('Content-Encoding', this.contentEncoding)
  set('Last-Modified', this.lastModified.toUTCString())
  set('Cache-Control', 'public, max-age=' + (this.maxAge / 1000))
  if (this.length !== undefined) set('Content-Length', this.length)

  this.createReadStream().pipe(res)
}

