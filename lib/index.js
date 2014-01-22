var path = require('path')
  , url = require('url')
  , MemoryResource = require('./MemoryResource')
  , FileResource = require('./FileResource')

module.exports = function() {

  var resources = {}

  function handle(req, res, next) {
    var p = url.parse(req.url).pathname
    var resource = resources[p]
    if (!resource) return next()
    resource.serve(req, res)
  }

  handle.expose = function(opts) {
    var p = opts.path
      , res

    if (opts.content) {
      res = new MemoryResource(p, opts.content, opts)
    }
    else {
      var f = opts.file || path.resolve(opts.root, './' + opts.path)
      if (!p) p = '/' + path.relative(opts.root, f)

      res = new FileResource(p, f, opts)
    }

    var prev = resources[p]
    resources[p] = res
    return {
      path: p,
      resource: res,
      dirty: res.isDifferent(prev)
    }
  }

  handle.get = function(path) {
    return resources[path]
  }

  handle.each = function(it) {
    for (var p in resources) {
      it(resources[p])
    }
  }

  return handle
}

