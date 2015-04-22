module.exports = {
	build: {
		cwd: 'src',
		expand: true,
		src: [
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