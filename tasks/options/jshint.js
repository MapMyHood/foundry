module.exports = {
	all: [
		'Gruntfile.js',
		'tasks/**/*.js',
		'src/js/**/*.js',
		'!src/js/lib/**'
	],
	options: {
		"loopfunc": true // true: Tolerate functions being defined in loops
	}

};