#exposed

[![Build Status](https://travis-ci.org/fgnass/exposed.png)](https://travis-ci.org/fgnass/exposed)

Connect-style middleware to serve buffers, strings or files.

Unlike `connect.static` it only serves files that have been explicitly exposed.
Files are streamed from disk while buffers and strings are kept in memory.

## Usage

    var exposed = require('exposed')
    var express = require('express')

    var expose = exposed()
    app.use(expose)

    // expose a string
    expose({ path: '/hello.txt', content: 'hello world' })

    // expose a file
    expose({ path: '/home/flx/foo/bar.txt', path: '/bar.txt' })

    // expose a file, strip `root` to determine the path
    expose({ file: '/home/flx/foo/bar.txt', root: '/home/flx' })

    // expose a file, resolve path relative to `root`
    expose({ path: '/bar.txt', root: '/home/flx' })


### The MIT License (MIT)

Copyright (c) 2013 Felix Gnass

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
