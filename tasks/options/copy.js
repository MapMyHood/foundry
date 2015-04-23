module.exports = {
	build: {
		cwd: 'src',
		expand: true,
		src: [
			'js/lib/**',
			'vendor/**',
			'css/**',
			'img/**',
			'res/**',
			'spec/**',
			'index.html',
			'icon.png',
			'spec.html'
		],
		dest: 'www'
	}
};