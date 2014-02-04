#exposed

[![Build Status](https://travis-ci.org/fgnass/exposed.png)](https://travis-ci.org/fgnass/exposed)

Connect-style middleware to serve buffers, strings or files.

Unlike `connect.static` it only serves files that have been explicitly exposed.
Files are streamed from disk while buffers and strings are kept in memory.

## Usage

```js
var exposed = require('exposed')
var express = require('express')

var resources = exposed()
app.use(resources)

// expose a string
resources.expose({ path: '/hello.txt', content: 'hello world' })

// expose a file
resources.expose({ path: '/home/flx/foo/bar.txt', path: '/bar.txt' })

// expose a file, strip `root` to determine the path
resources.expose({ file: '/home/flx/foo/bar.txt', root: '/home/flx' })

// expose a file, resolve path relative to `root`
resources.expose({ path: '/bar.txt', root: '/home/flx' })

// expose data from a readable stream
resources.expose({ path: '/stream', from: fs.createReadStream('bar.txt') })


// lookup an exposed resource and pipe it into a stream
resources.get('/foo').pipe(out)

// iterate of all exposed resources
resources.each(function(res) {
  console.log(res.path, res.toString())
})
```

## Events

You can listen for `change` events to get notified when the content of a
resource differs from a previously exposed resource under the same URL.

```js
resources.on('change', function(res) {
  console.log('Resource at %s has changed', res.url)
})
resources.expose({ path: '/foo', content: 'foo' })
resources.expose({ path: '/foo', content: 'bar' })
```

### The MIT License (MIT)

Copyright (c) 2014 Felix Gnass

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

