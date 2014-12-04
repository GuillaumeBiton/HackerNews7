/*jslint node: true */
/*global */

(function (gulp, connect, NWBuilder, open, del, deploy) {
	'use strict';
	
	var paths = {
		dependencies : [ "bower_components/framework7/dist/js/framework7.js", "bower_components/framework7/dist/js/framework7.js.map", "bower_components/framework7/dist/css/framework7.css", "bower_components/moment/moment.js" ],
		source : 'src/**/*',
		build : 'www'
	};
	
	gulp.task('clean', function (cb) {
		del([paths.build, 'build', 'cache' ], cb);
	});
	
	gulp.task('dependencies', function () {
		return gulp.src(paths.dependencies)
			.pipe(gulp.dest(paths.build + '/lib'));
	});
	
	gulp.task('html', [ 'dependencies' ], function () {
		gulp.src(paths.source).pipe(gulp.dest(paths.build)).pipe(connect.reload());
		gulp.src('package.json').pipe(gulp.dest(paths.build));
	});
	
	gulp.task('watch', function () {
		gulp.watch(paths.dependencies, [ 'dependencies' ]);
		gulp.watch(paths.source, [ 'html' ]);
	});
	
	gulp.task('server', function () {
		return connect.server({
			root: [ paths.build ],
			livereload: true
		});
	});
	
	gulp.task('open', function () {
		return gulp.src(paths.source).pipe(open('', { url: 'http://localhost:8080' }));
	});
	
	gulp.task('build', [ 'html' ], function () {
		var nw = new NWBuilder({
			files: paths.build + '/**',
			macIcns: paths.build + '/img/nw.icns',
			platforms: [ 'osx' ]
		});
		
		return nw.build();
	});
	
	gulp.task('deploy', function () {
		return gulp.src('./www/**/*')
			.pipe(deploy());
	});
	
	gulp.task('default', [ 'watch', 'dependencies', 'html', 'server', 'open' ]);
	
}(require('gulp'), require('gulp-connect'), require('node-webkit-builder'), require('gulp-open'), require('del'), require('gulp-gh-pages')));