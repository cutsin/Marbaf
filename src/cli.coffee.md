# Marbaf watcher/loader

	fs = require 'fs'
	path = require 'path'
	exec = require('child_process').exec
	chokidar = require 'chokidar'
	async = require 'async'
	extend = require 'extend'
	yml = require 'require-yml'
	ydump = require('js-yaml').dump

	conf = require '../config'
	source = path.join process.cwd(), conf.dir.git
	essay = path.join process.cwd(), conf.dir.essay
	uConfFile = path.resolve 'Marbaf.yml'
	uConf = yml uConfFile

	compiler = require('./compiler')(uConf) if uConf

	defRoot = path.join __dirname, '../deploy'

	# 
	cycleLock = []
	index = {}

	# initalize 
	make = (opts, force, cb) ->
		async.auto
			makeTree: (next) ->
				for key, val of conf.dir
					fs.mkdirSync val unless fs.existsSync val
				exec [
					'cp'
					defRoot + '/* ./'
					'; cp -rf'
					defRoot + '/theme/* ' + conf.dir.theme
				].join(' '), next
			gitClone: (next) ->
				return next() if fs.existsSync(source) and fs.existsSync source + '/.git/config'
				exec [
					'git clone'
					opts.repo
					source
				].join(' '), next
			makeConf: [
				'makeTree'
				(next) ->
					uConf = yml uConfFile if not uConf or force
					uConf = extend uConf, optsx
					fs.writeFile uConfFile, ydump(uConf), next
				]
		, cb


	indexer = (indexId, reindex, desc) ->
		console.log indexId, 'haha...'
		(err) ->
			delete index[indexId] if err
			# unlock
			cycleLock.pop()


	# git pull cycler
	cycler = () ->
		return setTimeout cycler, conf.cycleTimeAwait if cycleLock.length
		exec 'cd ' + source + '; git pull origin', (err) ->
			throw err if err
			cycler source

	convPath = (_path) ->
		_path.replace source, essay


	evts = ['unlink', 'unlinkDir', 'addDir', 'add', 'change']
	checkUpdate = (evt, name) ->
		# ignore unuseful evt
		return unless evt in evts
		cycleLock.push 1

		switch evt
			# delete anything
			when 'unlink', 'unlinkDir'
				exec 'rm -rf ' + convPath(name), indexer name, true
			# make directory & copy files
			when 'addDir'
				exec 'mkdir -p ' + convPath(name), indexer name
			# compile/copy file
			when 'add', 'change'
				suffix = path.extname name
				target = convPath name
				if suffix is '.md'
					target = target
										.replace suffix, '.html'
										.replace 'README', 'index'
					compiler.essay name, (err, essay) ->
						return console.error err if err
						fs.writeFile target, essay
						indexer target, true
				else
					exec 'cp -f ' + name, indexer name, true

	watch = () ->
		opts =
			ignored: /[\/\\]\./
		chokidar.watch source, opts
			.on 'all', checkUpdate
		cycler()

	module.exports = (force) ->

		init: (repo, name, desc) ->
			console.info 'Pending...'
			make 
				repo: repo
				name: name
				description: desc
				, force, ->
				console.info 'Init successed.\nYou can continue to run: `marbaf start` in current directory now.'

		start: ->
			watch()