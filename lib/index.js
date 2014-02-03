var path = require('path')
  , url = require('url')
  , util = require('util')
  , MemoryResource = require('./MemoryResource')
  , FileResource = require('./FileResource')
  , BufferedResource = require('./BufferedResource')
  , EventEmitter = require('events').EventEmitter


module.exports = function(opts) {
  return new Resources(opts || {})
}

function Resources(opts) {
  this.resources = {}
  this.root = opts.root || process.cwd()
  this.route = opts.route || ''
}

util.inherits(Resources, EventEmitter)

Resources.prototype.expose = function(opts) {
  var p = opts.path
  var f = opts.file || path.resolve(opts.root || this.root, './' + p)
  if (!p) p = '/' + path.relative(opts.root, f)

  var res
  if (opts.from) {
    res = new BufferedResource(p, opts.from, opts)
  }
  else if ('content' in opts) {
    res = new MemoryResource(p, opts.content, opts)
  }
  else {
    res = new FileResource(p, f, opts)
  }
  res.url = this.route + p
  var self = this
    , prev = this.set(p, res)

  if (prev) prev.compareTo(res, function(err, eq) {
    if (!err && !eq) self.emit('change', res)
  })

  return res
}

Resources.prototype.get = function(path) {
  return this.resources[path]
}

Resources.prototype.set = function(path, res) {
  var prev = this.get(path)
  this.resources[path] = res
  return prev
}

Resources.prototype.handle = function(req, res, next) {
  var p = url.parse(req.url).pathname
  var resource = this.resources[p]
  if (!resource) return next()
  resource.serve(req, res)
}

Resources.prototype.each = function(it) {
  var res = this.resources
  for (var p in res) it(res[p])
}
