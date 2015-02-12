# compiler

	markdown = require 'markdown'
	jade = require 'jade'

	jadeOpt =
		cache: true
		omitTag: 'radical'
		compileDebug: false

	module.exports = (theme) ->
		fn = jade.compileFile theme, jadeOpt
		(article) ->
			fn article