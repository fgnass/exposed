var path = require('path')
  , mime = require('mime')
  , util = require('util')
  , eq = require('stream-equal')
  , EventEmitter = require('events').EventEmitter
  , extname = path.extname

module.exports = Resource

function Resource(resources, opts) {
  if (!opts.path) {
    opts.path = '/' + path.relative(opts.root, opts.file)
    if (~opts.path.indexOf('../')) opts.path = opts.file
  }
  this.resources = resources
  this.opts = opts
  this.path = opts.path
  this.url = resources.route + opts.path

  this.maxAge = opts.maxAge || 0
  if (this.maxAge == Infinity) this.maxAge = 60 * 60 * 24 * 365 * 1000

  this.contentType = opts.contentType || mime.lookup(extname(opts.path))
  this.contentEncoding = opts.contentEncoding

  this.lastModified = new Date()
}

util.inherits(Resource, EventEmitter)

Resource.prototype.createReadStream = function() {
  throw Error('not implemented')
}

Resource.prototype.compareTo = function(res, cb) {
  eq(this.createReadStream(), res.createReadStream(), cb)
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
  set('Content-Length', this.length)
  set('Content-Encoding', this.contentEncoding)
  set('Last-Modified', this.lastModified.toUTCString())
  set('Cache-Control', 'public, max-age=' + (this.maxAge / 1000))


  this.createReadStream().pipe(res)
}

