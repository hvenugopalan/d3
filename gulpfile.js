// const gulp = require('gulp'),
//   webserver = require('gulp-webserver'),
//   postcss = require('gulp-postcss'),
//   gutil = require('gulp-util'),
//   sourcemaps = require('gulp-sourcemaps'),

//   dest = 'builds/d3/';

//   gulp.task('html', function() {
//     gulp.src(dest + '*.html');
//   });

//   gulp.task('css', function() {
//     gulp.dest(dest + 'css');
//   });

//   gulp.task('js', function() {
//     gulp.dest(dest + 'js');
//   });

//   gulp.task('watch', function() {
//     gulp.watch(dest + '**/*.css', ['css'])
//     .on('change', function(path, stats) {
//       console.log(path);
//       // code to execute on change
//   })
//   .on('unlink', function(path, stats) {
//       console.log(path);
//       // code to execute on delete
//   });
//     gulp.watch(dest + '**/*.js', ['js'])
//     .on('change', function(path, stats) {
//       console.log(path);
//       // code to execute on change
//   })
//   .on('unlink', function(path, stats) {
//       console.log(path);
//       // code to execute on delete
//   });
//     gulp.watch(dest + '**/*.html', ['html'])
//     .on('change', function(path, stats) {
//       console.log(path);
//       // code to execute on change
//   })
//   .on('unlink', function(path, stats) {
//       console.log(path);
//       // code to execute on delete
//   });
//   });

// gulp.task('webserver', function() {
//   gulp.src(dest)
//     .pipe(webserver({
//       livereload: true,
//       port: 3000,
//       open: true
//     }));
// });

// gulp.task('default', ['html', 'css', 'webserver','watch']);
const gulp = require('gulp');
const pug = require('gulp-pug');
const less = require('gulp-less');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const dest = 'builds/d3/';
const webserver = require('gulp-webserver');

function html() {
  return gulp.src(dest + '*.html');
}

function css() {
  return gulp.dest(dest + 'css');
  // return gulp.src('client/templates/*.less')
  //   .pipe(less())
  //   .pipe(minifyCSS())
  //   .pipe(gulp.dest('build/css'))
}

function js() {
  // return gulp.src('client/javascript/*.js', { sourcemaps: true })
  //   .pipe(concat('app.min.js'))
  //   .pipe(gulp.dest('build/js', { sourcemaps: true }))
  return gulp.dest(dest + 'js');
}

function serve() {
  return gulp.src(dest)
      .pipe(webserver({
        livereload: true,
        port: 3000,
        open: true
      }));
}
exports.js = js;
exports.css = css;
exports.html = html;
exports.serve = serve; 
exports.default = gulp.parallel(html, css, js, serve);