var util = require('util')
  , zlib = require('zlib')
  , ReadStream = require('./ReadStream')
  , Resource = require('./Resource')

module.exports = MemoryResource

function MemoryResource(resources, opts) {
  Resource.apply(this, arguments)
  this.data = opts.content
  this.length = Buffer.isBuffer(this.data)
    ? this.data.length
    : Buffer.byteLength(this.data)

  if (opts.gzip) {
    var self = this
    zlib.gzip(this.data, function(err, zipped) {
      self.gzip = new MemoryResource(resources, {
        __proto__: opts,
        content: zipped,
        contentType: self.contentType,
        contentEncoding: 'gzip',
        gzip: false
      })
    })
  }
}

util.inherits(MemoryResource, Resource)

MemoryResource.prototype.compareTo = function(res, cb) {
  Resource.prototype.compareTo.call(this, res, cb)
}

MemoryResource.prototype.createReadStream = function() {
  return new ReadStream(this.data)
}
