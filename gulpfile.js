var gulp = require('gulp');
var paths = require('./gulp/gulp.config.json');
var plug = require('gulp-load-plugins')();

gulp.task('default', ['watch','pug','sass']);

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.pug, ['pug', 'sass']);
});

gulp.task('sass', function () {
  return gulp.src(paths.sass)
    .pipe(plug.plumber())
    .pipe(plug.sass({sourceComments:'normal'}))
    .pipe(plug.autoprefixer('last 2 version'))
    .pipe(gulp.dest(function(file) {
      return file.base; 
    }))
    .pipe(plug.size());
});

gulp.task('pug', function () {
  return gulp.src(paths.pug)
    .pipe(plug.pug({
      pretty: true
    }))
    .pipe(gulp.dest(function(file) {
      return file.base; 
    }))
});
