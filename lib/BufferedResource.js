var util = require('util')
  , concat = require('concat-stream')
  , PendingResource = require('./PendingResource')

module.exports = BufferedResource

function BufferedResource(resources, opts) {
  PendingResource.apply(this, arguments)
  var self = this
  opts.from.pipe(concat(function(data) {
    self.update(data)
  }))
}

util.inherits(BufferedResource, PendingResource)
