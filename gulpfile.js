var gulp = require('gulp');

var gbro = require('gulp-browserify');
var reactify = require('reactify');
var envify = require('envify');

var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');

var liveReload = require('gulp-livereload');

function errHandler(err){
    gutil.beep();
    gutil.log(err);
}

gulp.task('bundle', function(){
    gulp.src('lib/app.js')
        .pipe( plumber({errorHandler: errHandler}) )
        .pipe( gbro({
            transform: [reactify, envify],
                debug: true
        }) )
        .pipe( rename('bundle.js') )
        .pipe(gulp.dest('lib/'))
});

gulp.task('watch', function(){
    liveReload.listen();

    gulp.watch(['lib/**/*.js', '!lib/bundle.js'], ['bundle']);

    gulp.watch(['lib/bundle.js', 'layout/layout.css'], liveReload.changed);
});

gulp.task('default', ['bundle']);

gulp.task('wd', ['bundle', 'watch']);