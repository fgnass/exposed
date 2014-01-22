var Stream = require('readable-stream')
  , util = require('util')

module.exports = ReadStream

util.inherits(ReadStream, Stream.Readable)

function ReadStream(data) {
  Stream.Readable.call(this)
  this._data = data
}

ReadStream.prototype._read = function(n) {
  this.push(this._data)
  this._data = null
}
