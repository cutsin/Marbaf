// Generated by CoffeeScript 1.8.0
var async, checkUpdate, chokidar, compiler, conf, cycler, exec, fs, isLocked, make, nm, path, theme, yml;

nm = 'githublog';

fs = require('fs');

path = require('path');

exec = require('child_process').exec;

chokidar = require('chokidar');

async = require('async');

yml = require('require-yml');

conf = yml(path.resolve(__dirname, '../conf')).base;

compiler = require('./compiler');

isLocked = false;

theme = 'default';

make = function(repo, cb) {
  return async.auto({
    makeTree: function(next) {
      var key, val, _ref;
      _ref = conf.dir;
      for (key in _ref) {
        val = _ref[key];
        if (!fs.existsSync(val)) {
          fs.mkdirSync(val);
        }
      }
      return next();
    },
    gitClone: function(next) {
      var _path;
      _path = conf.dir.git;
      if (fs.existsSync(_path) && fs.existsSync(_path + '/.git/config')) {
        return next();
      }
      return exec(['git clone', repo, _path].join(' '), next);
    },
    makeFile: function(next) {
      return exec(['cp', path.join(__dirname, '../deploy/* ./'), '; cp -rf', path.join(__dirname, '../deploy/theme/* ' + conf.dir.theme)].join(' '), next);
    }
  }, cb);
};

cycler = function(dir) {
  if (isLocked) {
    return setTimeout(cycler, cycleTimeAwait);
  }
  return;
  return exec('cd ' + dir + '; git pull origin', function(err) {
    if (err) {
      throw err;
    }
    return cycler(dir);
  });
};

checkUpdate = function(evt, name) {
  isLocked = true;
  console.log(evt, name);
  console.log(makr);
  return isLocked = false;
};

module.exports = {
  init: function(repo) {
    if (!/^(https:\/\/|git@)/.test(repo)) {
      return console.error('Plese specific a valid git-repo first!');
    }
    console.info('Pending...');
    return make(repo, function() {
      return console.log('Init successed.\nYou can continue to run: `githublog start` in current directory now.');
    });
  },
  watch: function() {
    var dir, opts, user;
    user = yml(nm);
    console.log(user);
    return;
    opts = {
      ignored: /[\/\\]\./
    };
    dir = path.join(process.cwd(), conf.dir.git);
    cycler(dir);
    return chokidar.watch(dir, opts).on('all', checkUpdate);
  },
  start: function() {
    var loader;
    loader = path.join(process.cwd(), nm + '.js');
    return pm2.connect(function(err) {
      return pm2.start(loader, {
        name: nm
      }, function(err, proc) {
        return pm2.disconnect(function() {
          return process.exit(0);
        });
      });
    });
  },
  list: function() {
    return console.log('will start by pm2');
  }
};