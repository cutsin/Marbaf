# prebuild

	fs = require 'fs'
	path = require 'path'
	exec = require('child_process').exec
	async = require 'async'
	request = require 'superagent'
	cleanCSS = require 'clean-css'

	md = 'https://raw.githubusercontent.com/sindresorhus/github-markdown-css/gh-pages/github-markdown.css'

	file_md = './src/markdown.css'
	file_base = './src/base.css'
	file_g = './deploy/theme/g.css'

	makeCSS = (cb) ->

		async.waterfall [
			# fetch from github
			(next) ->
				request.get md, (res) ->
					return next res if res.clientError or res.serverError or !res.text
					next null, res.text
			# update markdown.css
			(csstxt, next) ->
				fs.writeFile file_md, csstxt, next
			# merge
			(next) ->
				exec ['cat', file_base, file_md].join(' '), next
			(mergedcss, next) ->
				fs.writeFile file_g, new cleanCSS().minify(mergedcss).styles, next
		], cb

	makeCSS ->