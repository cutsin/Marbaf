# GitHubLog Deamon

	require('child_process').exec 'node /vagrant/public/GitHubLog/bin/githublog watch', () ->
		console.log arguments