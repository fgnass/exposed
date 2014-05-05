var path = require('path')
  , url = require('url')
  , util = require('util')
  , MemoryResource = require('./MemoryResource')
  , FileResource = require('./FileResource')
  , BufferedResource = require('./BufferedResource')
  , PendingResource = require('./PendingResource')
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
  var res
  if (typeof opts == 'string') opts = { file: opts }
  else if ('content' in opts) res = new MemoryResource(this, opts)
  else if (opts.from) res = new BufferedResource(this, opts)
  else if (opts.pending) res = new PendingResource(this, opts)
  else res = new FileResource(this, opts)

  var self = this
  var prev = this.set(res.path, res)
  if (prev && this.listeners('change').length) {
    prev.compareTo(res, function(err, eq) {
      if (!err && !eq) self.emit('change', res)
    })
  }

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

Resources.prototype.list = function() {
  var res = this.resources
  return Object.keys(res).map(function(path) { return res[path] })
}

Resources.prototype.each = function(it) {
  this.list().forEach(it)
}
