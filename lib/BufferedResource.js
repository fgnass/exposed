var util = require('util')
  , through = require('through')
  , concat = require('concat-stream')
  , Resource = require('./Resource')
  , MemoryResource = require('./MemoryResource')

module.exports = BufferedResource

function BufferedResource(path, stream, opts) {
  var self = this
  this.path = path
  stream.pipe(concat(function(data) {
    self.resource = new MemoryResource(path, data, opts)
    self.emit('ready')
  }))
}

util.inherits(BufferedResource, Resource)

BufferedResource.prototype.serve = function(req, res) {
  if (this.resource) return this.resource.serve(req, res)
  this.on('ready', function() {
    this.resource.serve(req, res)
  })
}

BufferedResource.prototype.createReadStream = function() {
  if (this.resource) return this.resource.createReadStream()
  var rs = through()
  this.on('ready', function() {
    this.resource.createReadStream().pipe(rs)
  })
  return rs
}
