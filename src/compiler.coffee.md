# compiler

	fs = require 'fs'
	path = require 'path'
	markdown = require('markdown').markdown
	jade = require 'jade'

	conf = require '../config'

	jadeOpt =
		cache: true
		omitTag: 'radical'
		compileDebug: false
		baseDir: ''

	# compile markdown file
	md = (sourcePath, cb) ->
		fs.readFile sourcePath, 'utf-8', (err, cnt) ->
			return cb err if err
			try
				return cb null, markdown.toHTML cnt
			catch e
				return cb e

	module.exports = (uConf) ->
		jadeOpt.baseDir = path.join conf.dir.theme, uConf.theme or 'default'

		tmpls = {}
		funcs =
			markdown: md

		fs.readdirSync(jadeOpt.baseDir).forEach (item) ->
			reg = /\.jade$/
			return unless reg.test item
			key = item.replace reg, ''
			tmplPath = path.resolve jadeOpt.baseDir, item
			tmpls[key] = jade.compileFile tmplPath, jadeOpt
			funcs[key] = (sourcePath, cb) ->
				locals = uConf

				md sourcePath, (err, cnt) ->
					return cb err if err
					locals[key] = cnt
					cb null, tmpls[key] locals

		funcs