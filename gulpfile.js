'use strict';

var gulp = require('gulp');

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var transform = require('vinyl-transform');

// Scripts
gulp.task('js', function () {
    var browserified = transform(function (filename) {
        var b = browserify(filename, {debug: true});
        return b.bundle();
    });
    browserified.on('error', function(e){
        console.error(e.message);
        this.emit('end');
    });
    return gulp.src('main.js')
        .pipe(browserified)
        .pipe($.sourcemaps.init())
        .pipe($.uglify())
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('img', function () {
    return gulp.src('src/img/**')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{cleanupIDs: false}]
        })))
        .pipe(gulp.dest('dist/img/'));
});

// Webserver
gulp.task('serve', function () {
    gulp.src('./dist')
        .pipe($.webserver({
            livereload: true,
            port: 9000
        }));
});
// Watch
gulp.task('watch', ['js', 'img'], function () {
    gulp.watch(['src/**/*.js', 'src/**/*.scss', 'main.js'], ['js']);
    gulp.watch(['src/img/**'], ['img']);
});

gulp.task('dev', ['watch', 'serve']);
// Default task
gulp.task('default', ['js']);
