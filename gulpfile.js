var gulp = require('gulp');

var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var liveReload = require('gulp-livereload');
var rename = require('gulp-rename');
var cond = require('gulp-cond');
var uglify = require('gulp-uglify');

var less = require('gulp-less');

var gbro = require('gulp-browserify');
var reactify = require('reactify');
var envify = require('envify');


function errHandler(err){
    gutil.beep();
    gutil.log(err);
}


var productTasks = [undefined, 'default'];
var proEnv = false;

var taskName = (process.argv[0] === 'node')? process.argv[2] : process.argv[1];
if( productTasks.indexOf(taskName) >= 0 ){
    proEnv = true;
}

var main = {
    less: ['layout/less/layout.less'],
    js: ['lib/app.js']
};

gulp.task('less', function(){
    gulp.src( main.less )
        .pipe( plumber({errorHandler: errHandler}) )
        .pipe( less({dumpLineNumbers: 'comments'}) )
        .pipe( gulp.dest('layout/css') );
});


gulp.task('react', function(){
    gulp.src( main.js )
        .pipe(plumber({errorHandler: errHandler}))
        .pipe(gbro({
            transform: [reactify, envify],
            debug: !proEnv
        }))
        .pipe( cond(proEnv, uglify()) )
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('./lib'));
});




gulp.task('watch', function(){
    liveReload.listen();

    var less2Watch = ['layout/less/**/*.less'];
    var less2Reload = ['layout/css/layout*.css'];
    gulp.watch(less2Watch,  ['less']);
    gulp.watch(less2Reload, liveReload.changed);

    var js2Watch = ['./lib/**/*.js', '!./lib/bundle.js'];
    var js2Reload = ['./lib/bundle.js'];
    gulp.watch(js2Watch, ['react']);
    gulp.watch(js2Reload, liveReload.changed);

});

gulp.task('default', ['less', 'react']);
gulp.task('wd', ['less', 'react', 'watch']);