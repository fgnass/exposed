var util = require('util')
  , through = require('through')
  , Resource = require('./Resource')

module.exports = PendingResource

function PendingResource(resources, opts) {
  Resource.apply(this, arguments)
}

util.inherits(PendingResource, Resource)

PendingResource.prototype.update = function(content) {
  var opts = Object.create(this.opts)
  opts.content = content
  opts.pending = false
  var pending = !this.res
  this.res = this.resources.expose(opts)
  if (pending) this.emit('ready')
}

PendingResource.prototype.serve = function(req, res) {
  if (this.res) return this.res.serve(req, res)
  this.once('ready', function() {
    this.res.serve(req, res)
  })
}

PendingResource.prototype.createReadStream = function() {
  if (this.res) return this.res.createReadStream()
  var rs = through()
  this.once('ready', function() {
    this.res.createReadStream().pipe(rs)
  })
  return rs
}
