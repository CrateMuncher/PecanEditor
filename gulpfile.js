var gulp = require("gulp");
var browserify = require("gulp-browserify");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var zip = require("gulp-zip");
var clean = require("gulp-clean");

var path = require("path");

var cp = require("child_process");

gulp.task('compile', function() {
	return gulp.src('src/boot.js')
        .pipe(browserify({
        	builtins: [],
        	detectGlobals: false,
        }))
//      .pipe(uglify())
        .pipe(rename("pecan.js"))
        .pipe(gulp.dest('dist/tmp'));
});

gulp.task('copyfiles', function() {
	return gulp.src(
		[
    		'package.json',
    		'pecan.html',
    	]
    )
    	.pipe(gulp.dest('dist/tmp'));
});

gulp.task('copylibs', function() {
	return gulp.src('lib/**/*')
    	.pipe(gulp.dest('dist/tmp/lib'));
});

gulp.task('zip', ['compile', 'copylibs', 'copyfiles'], function() {
	return gulp.src('dist/tmp/**/*')
    	.pipe(zip('pecan.nw'))
    	.pipe(gulp.dest('dist'));
})

gulp.task('clean', ['zip'], function() {
    // This only works sometimes and I have no idea why
	/*return gulp.src('dist/tmp')
		.pipe(clean());*/
})

gulp.task('build', ['clean']);

gulp.task('default', ['build']);

gulp.task('test', ['build'], function() {
	cp.exec("\"node_modules/.bin/nodewebkit\" ./dist/pecan.nw", {
		env: (function() {
			process.env.test_cwd = process.cwd();
			return process.env;
		})()
	});
});