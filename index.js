var url = require('url')
  , path = require('path')
  , zlib = require('zlib')
  , mime = require('mime')
  , fs = require('fs')

module.exports = function(defaults) {
  var handlers = {}

  function expose(opts) {
    opts.__proto__ = defaults
    var str = opts.content
      , buf = Buffer.isBuffer(str)
      , f = !str && (opts.file || path.resolve(opts.root, './' + opts.path))
      , p = opts.path || '/' + path.relative(opts.root, f)
      , stat = f && fs.statSync(f)
      , lastModified = stat? stat.mtime : new Date()
      , length = stat ? stat.size : buf ? str.length : Buffer.byteLength(str)
      , maxAge = opts.maxAge || 0

    if (maxAge == Infinity) maxAge = 60 * 60 * 24 * 365 * 1000

    var headers = {
      __proto__: opts.headers,
      "Content-Type": opts.type || mime.lookup(path.extname(p)),
      "Etag": '"' + length + '-' + Number(lastModified) + '"',
      "Last-Modified": lastModified.toUTCString(),
      "Cache-Control": 'public, max-age=' + (maxAge / 1000)
    }

    var gzip
    if (str && opts.gzip) zlib.gzip(str, function(err, data) { gzip = data })

    handlers[p] = function(req, res) {
      res.setHeader('Date', new Date().toUTCString())
      for (var n in headers) res.setHeader(n, headers[n])

      if (gzip && /gzip/i.exec(req.headers['accept-encoding'])) {
        res.setHeader('Content-Encoding', 'gzip')
        res.setHeader('Content-Length', gzip.length)
        res.end(gzip)
      }
      else {
        res.setHeader('Content-Length', length)
        if (str) res.end(str)
        else fs.createReadStream(f).pipe(res)
      }
    }
  }

  return function (req, res, next) {
    if (!res) return expose(req)

    var p = url.parse(req.url).pathname
      , handle = handlers[p]

    if (handle) handle(req, res)
    else next()
  }
}
