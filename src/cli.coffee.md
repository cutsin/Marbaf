# GitHubLog watcher/loader

	nm = 'githublog'
	fs = require 'fs'
	path = require 'path'
	exec = require('child_process').exec
	chokidar = require 'chokidar'
	async = require 'async'

	yml = require 'require-yml'
	conf = yml(path.resolve __dirname, '../conf').base
	
	compiler = require './compiler'
	isLocked = false

	theme = 'default'

	# initalize 
	make = (repo, cb) ->
		async.auto
			makeTree: (next) ->
				for key, val of conf.dir
					fs.mkdirSync val unless fs.existsSync val
				next()
			gitClone: (next) ->
				_path = conf.dir.git
				return next() if fs.existsSync(_path) and fs.existsSync _path + '/.git/config'
				exec [
					'git clone'
					repo
					_path
				].join(' '), next
			makeFile: (next) ->
				exec [
					'cp'
					path.join __dirname, '../deploy/* ./'
					'; cp -rf'
					path.join __dirname, '../deploy/theme/* ' + conf.dir.theme
				].join(' '), next
		, cb

	# git pull cycler
	cycler = (dir) ->
		return setTimeout cycler, cycleTimeAwait if isLocked



		return
		exec 'cd ' + dir + '; git pull origin', (err) ->
			throw err if err
			cycler dir

	checkUpdate = (evt, name) ->
		isLocked = true
		console.log evt, name
		console.log makr
		isLocked = false

	module.exports =
		init: (repo) ->
			return console.error 'Plese specific a valid git-repo first!' unless /^(https:\/\/|git@)/.test repo
			console.info 'Pending...'
			make repo, ->
				console.log 'Init successed.\nYou can continue to run: `githublog start` in current directory now.'

		watch: ->
			user = yml nm
			console.log user
			return
			opts =
				ignored: /[\/\\]\./
			dir = path.join process.cwd(), conf.dir.git
			cycler dir
			chokidar.watch dir, opts
				.on 'all', checkUpdate

		start: ->
			loader = path.join process.cwd(), nm + '.js'
			pm2.connect (err) ->
				pm2.start loader, name: nm, (err, proc) ->
					pm2.disconnect ->
						process.exit 0

		list: ->
			console.log 'will start by pm2'
