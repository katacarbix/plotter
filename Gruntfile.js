module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		compass: {
			dist: {
				options: {
					sassDir: 'assets/scss',
					cssDir: 'assets/css'
				}
			}
		},
		browserify: {
			options: {
				debug: true,
				transform: ['babelify'],
				extensions: ['.js'],
			},
			dev: {
				options: {
					alias: ['react:'] // Make React available externally for dev tools
				},
				src: 'renderer.jsx',
				dest: 'dist/bundle.js'
			}
		},
		babel: {
			options: {
				sourceMap: true
			},
			dist: {
				src: '**/*.jsx',
				dest: 'dist/bundle.js'
			}
		},
		watch: {
			css: {
				files: '**/*.scss',
				tasks: ['compass']
			},
			browserify: {
				files: '**/*.jsx',
				tasks: ['browserify']
			},
			//babel: {
			//	files: ['app/*.jsx?'],
			//	tasks: ['babel']
			//}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['watch']);
}
