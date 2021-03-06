/**
 * Created by Roman Spiridonov <romars@phystech.edu> on 5/8/2017.
 */
"use strict";

const
  // Libraries
  expect = require('chai').expect,
  sinon = require('sinon'),
  gulp = require('gulp'),
  path = require('path'),
  fs = require('fs-extra'),

// Project modules
  gulpPluginFabric = require('../gulpPluginFabric');

const fixturesDir = path.join(__dirname, 'fixtures');

function runGulpTest(plugin, param, runTests) {
  return gulp.src(`${fixturesDir}/in/test.txt`)
    .pipe(plugin(param))  // --> launching the plugin under test
    .pipe(gulp.dest(`${fixturesDir}/out`))
    .on('end', function () {
      let result = fs.readFileSync(`${fixturesDir}/out/test.txt`, {encoding: 'utf-8'});
      runTests(result);
    });
}

describe("gulpPluginFabric", function () {
  beforeEach(function () {
    fs.removeSync(`${fixturesDir}/out`);
    fs.ensureDirSync(`${fixturesDir}/out`);
  });

  it("Throws error on no-read and displays correct plugin name", function (done) {
    let plugin = gulpPluginFabric("test", (str) => str + "!");
    gulp.src(`${fixturesDir}/in/test.txt`, {read: false})
      .pipe(plugin())
      .on('error', function (err) {
        expect(err).to.exist;
        expect(err.message).to.match(/test/);
        done();
      })
      .on('end', function () {
        expect.fail(1, 0, "Expected plugin to throw an error, but no error received.");
        done();
      })
  });

  it("Works in gulp (sync func)", function (done) {
    let plugin = gulpPluginFabric("test", (str, options) => str + options.suffix);

    runGulpTest(plugin, {suffix: "!"}, (result) => {
      expect(result).to.equal("Some text!");
      done();
    });
  });

  it("Works in gulp (async func)", function (done) {
    let plugin = gulpPluginFabric("test", (str, options, cb) => setTimeout(cb(null, str + options.suffix), 0));

    runGulpTest(plugin, {suffix: "!"}, (result) => {
      expect(result).to.equal("Some text!");
      done();
    });
  });

  it("Works in gulp (async obj, with init)", function (done) {
    let c = {
      callsFunc: 0,
      callsInit: 0,
      _name: "test",
      func: function (text, options, cb) {
        ++this.callsFunc;
        setTimeout(cb(null, text + this._suffix), 0);
      },
      init: function (options) {
        ++this.callsInit;
        this._suffix = options.suffix;
      }
    };

    let plugin = gulpPluginFabric(c._name, c.func.bind(c), c.init.bind(c));

    runGulpTest(plugin, {suffix: "!"}, (result) => {
      expect(result).to.equal("Some text!");
      expect(c._suffix).to.equal("!");
      expect(c.callsFunc).to.equal(1);
      expect(c.callsInit).to.equal(1);
      done();
    });
  });

  it("Works in gulp (async obj, without init)", function (done) {
    let c = {
      callsFunc: 0,
      callsInit: 0,
      _name: "test",
      func: function (text, options, cb) {
        ++this.callsFunc;
        setTimeout(cb(null, text + options.suffix), 0);
      },
      init: function () {
        ++this.callsInit;
      }
    };

    let plugin = gulpPluginFabric(c._name, c.func.bind(c));

    runGulpTest(plugin, {suffix: "!"}, (result) => {
      expect(result).to.equal("Some text!");
      expect(c.callsFunc).to.equal(1);
      expect(c.callsInit).to.equal(0);
      done();
    });
  });

  it("Works in gulp (sync obj, without init)", function (done) {
    let c = {
      callsFunc: 0,
      callsInit: 0,
      _name: "test",
      func: function (text, options) {
        ++this.callsFunc;
        return text + options.suffix;
      },
      init: function () {
        ++this.callsInit;
      }
    };

    let plugin = gulpPluginFabric(c._name, c.func.bind(c));

    runGulpTest(plugin, {suffix: "!"}, (result) => {
      expect(result).to.equal("Some text!");
      expect(c.callsFunc).to.equal(1);
      expect(c.callsInit).to.equal(0);
      done();
    });
  });
});
