Create gulp plugin from a function or object that works with string data (e.g. a converter).

# API
Exposes function that returns a gulp plugin: `gulpPluginFabric(name, run, [init])`.
* `name`: name of the plugin (will be `gulp-name`)
* `run`: function that transforms incoming data, can be both sync or async
* `init`: function that is launched before `run` with options (optional)

The following types of functions are supported:
1. Sync: `run(data, options)` returns resulting string, or throws an error
2. Async: `run(data, options, cb)` calls `cb(null, result)` upon successful completion, or `cb(err)` in case of an error

In all cases, if `init` is provided, then `options` argument should be omitted, i.e. use `run(data)` instead of `run(data, options)`.

# Examples
Convert function to gulp plugin: 
```javascript
let run = (text, options) => text + options.suffix;
let plugin = require('gulpPluginFabric')("my-plugin", run);
```

Convert object to gulp plugin:
```javascript
let runner = {
  _suffix: "!", 
  run: function(text, options) {
    return text + this._suffix;
  }, 
  init: function (options) { 
    this._suffix = options.suffix | ""; 
  }
};

let plugin = require('gulpPluginFabric')("my-plugin", runner.run.bind(runner), runner.init.bind(runner));
```

Then you can use plugin in gulp as follows:
```javascript
gulp.src('.')
    .pipe(plugin({suffix: "!"}))
    .pipe(gulp.dest('out'));
```