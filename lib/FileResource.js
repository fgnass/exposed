var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , Resource = require('./Resource')

module.exports = FileResource

function FileResource(resources, opts) {
  if (!opts.file) {
    opts.file = path.resolve(opts.root || resources.root, './' + opts.path)
  }
  Resource.call(this, resources, opts)
  var stat = fs.statSync(opts.file)
  this.length = stat.size
  this.lastModified = stat.mtime
}

util.inherits(FileResource, Resource)

FileResource.prototype.createReadStream = function() {
  return fs.createReadStream(this.opts.file)
}
