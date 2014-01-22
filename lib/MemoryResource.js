var util = require('util')
  , zlib = require('zlib')
  , ReadStream = require('./ReadStream')
  , Resource = require('./Resource')

module.exports = MemoryResource

function MemoryResource(path, data, opts) {
  Resource.call(this, path, opts)
  this.data = data
  this.length = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)

  if (opts.gzip) {
    var self = this
    zlib.gzip(data, function(err, zipped) {
      self.gzip = new MemoryResource(path, zipped, {
        __proto__: opts,
        contentType: self.contentType,
        contentEncoding: 'gzip',
        gzip: false
      })
    })
  }
}

util.inherits(MemoryResource, Resource)

MemoryResource.prototype.createReadStream = function() {
  return new ReadStream(this.data)
}

MemoryResource.prototype.toString = function() {
  return this.data.toString()
}

MemoryResource.prototype.isDifferent = function(f) {
  return String(f) != this.toString()
}