var fs = require('fs')
  , util = require('util')
  , Resource = require('./Resource')

module.exports = FileResource

function FileResource(path, file, opts) {
  Resource.call(this, path, opts)
  var stat = fs.statSync(file)
  this.file = file
  this.length = stat.size
  this.lastModified = stat.mtime
}

util.inherits(FileResource, Resource)

FileResource.prototype.createReadStream = function() {
  return fs.createReadStream(this.file)
}
