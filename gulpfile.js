var fs             = require('fs');
var gulp           = require('gulp');
var autoprefixer   = require('gulp-autoprefixer');
var cleanCSS       = require('gulp-clean-css');
var filter         = require('gulp-filter');
var include        = require('gulp-include');
var jshint         = require('gulp-jshint');
var less           = require('gulp-less');
var modernizr      = require('gulp-modernizr');
var plumber        = require('gulp-plumber');
var realFavicon    = require('gulp-real-favicon');
var sequence       = require('gulp-sequence');
var sourcemaps     = require('gulp-sourcemaps');
var svgSprite      = require('gulp-svg-sprites');
var svg2png        = require('gulp-svg2png');
var uglify         = require('gulp-uglify');
var livereload     = require('gulp-livereload');

var lessImportNPM  = require('less-plugin-npm-import');

var plumberOptions = {
  errorHandler: function (err) {
    console.log(err);
    this.emit('end');
  }
};

// Sprites
gulp.task('sprites', function () {
  return gulp.src('./assets/icons/*.svg')
    .pipe(plumber(plumberOptions))
    .pipe(svgSprite({
      preview: false,
      cssFile: '../assets/less/imports/sprite.less',
      svg: {
        sprite: 'images/sprite.svg'
      },
      padding: 5
    }))
    .pipe(gulp.dest('./public'))
    .pipe(filter('**/*.svg'))
    .pipe(svg2png())
    .pipe(gulp.dest('./public'));
});

// Images
gulp.task('images', function () {
  return gulp.src('./assets/images/**/*')
    .pipe(gulp.dest('./public/images'))
    .pipe(filter('**/*.svg'))
    .pipe(svg2png())
    .pipe(gulp.dest('./public/images'));
});

// Fonts
gulp.task('fonts', function () {
  return gulp.src('./assets/fonts/**/*')
    .pipe(gulp.dest('./public/fonts'));
});

// Less
gulp.task('styles', function() {
  return gulp.src('./assets/less/*.less')
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(less({
      plugins: [ new lessImportNPM() ]
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie >= 10']
    }))
    .pipe(cleanCSS({
      compatibility: 'ie10',
      inline: ['none']
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload());
});

// JS
gulp.task('scripts', function() {
  return gulp.src('./assets/js/*.js')
    .pipe(plumber(plumberOptions))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(include({
      includePaths: [
        __dirname + '/assets/js',
        __dirname + '/node_modules'
      ]
    }))
    .pipe(jshint())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js'))
    .pipe(livereload());
});

// Modernizr
gulp.task('modernizr', function () {
  return gulp.src(['./public/js/*.js', './public/css/*.css'])
    .pipe(plumber(plumberOptions))
    .pipe(modernizr({
      'tests': [
        'js',
        'touchevents'
      ],
      'options': [
        'setClasses',
        'addTest',
        'testProp',
        'fnBind'
      ]
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'))
});

// Favicon
gulp.task('favicon', function (done) {
  // File where the favicon markups are stored
  var FAVICON_DATA_FILE = './assets/faviconData.json';

  realFavicon.generateFavicon({
    masterPicture: './assets/favicon.svg',
    dest: './public/favicons/',
    iconsPath: 'public/favicons/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '6px',
        assets: {
          ios6AndPriorIcons: false,
          ios7AndLaterIcons: false,
          precomposedIcons: false,
          declareOnlyDefaultIcon: true
        }
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#ffffff',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: false,
          windows10Ie11EdgeTiles: {
            small: false,
            medium: true,
            big: false,
            rectangle: false
          }
        }
      },
      androidChrome: {
        pictureAspect: 'backgroundAndMargin',
        margin: '17%',
        backgroundColor: '#ffffff',
        themeColor: '#ffffff',
        manifest: {
          name: 'MAVEN',
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'blackAndWhite',
        threshold: 60.15625,
        themeColor: '#1CB74D'
      }
    },
    settings: {
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false,
      readmeFile: false,
      htmlCodeFile: false,
      usePathAsIs: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

gulp.task('default', gulp.series(function(done) {    
  gulp.parallel(['favicon', 'fonts', 'images', 'sprites']),
  gulp.parallel(['styles', 'scripts']),
  gulp.parallel('modernizr')
  done();
}));

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('**/*.php', { cwd: './' }).on(['change'], livereload.changed);
  gulp.watch('assets/less/**/*.less', { cwd: './' }, gulp.series('styles'));
  gulp.watch('assets/js/**/*.js', { cwd: './' }, gulp.series('scripts'));
  gulp.watch('assets/icons/*.svg', { cwd: './' }, gulp.series('sprites'));
  gulp.watch('assets/images/*', { cwd: './' }, gulp.series('images'));
  gulp.watch('assets/fonts/*', { cwd: './' }, gulp.series('fonts'));
});

// gulp.task('default', gulp.series([
//  gulp.parallel(['favicon', 'fonts', 'images', 'sprites']),
//   gulp.parallel(['styles', 'scripts']),
//   gulp.parallel('modernizr')
// ]));

// gulp.task('watch', gulp.series('default', function() {
//   livereload.listen();
//   gulp.watch('**/*.php', { cwd: './' }).on(['change'], livereload.changed);
//   gulp.watch('assets/less/**/*.less', { cwd: './' }, gulp.series('styles'));
//   gulp.watch('assets/js/**/*.js', { cwd: './' }, gulp.series('scripts'));
//   gulp.watch('assets/icons/*.svg', { cwd: './' }, gulp.series('sprites'));
//   gulp.watch('assets/images/*', { cwd: './' }, gulp.series('images'));
//   gulp.watch('assets/fonts/*', { cwd: './' }, gulp.series('fonts'));
// }));

