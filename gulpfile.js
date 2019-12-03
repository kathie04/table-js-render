
const gulp           = require('gulp'); // gulp
const sass           = require('gulp-sass'); // compile scss to css
const imageop        = require('gulp-image-optimization'); // image optimization
const include        = require('gulp-include'); //
const browserSync    = require('browser-sync'); // live reload browser
const imagemin       = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
const pngquant       = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
const debug          = require('gulp-debug');
const del            = require('del');
const sourcemaps     = require('gulp-sourcemaps');
const cleanCSS       = require('gulp-clean-css');
const autoprefixer   = require('gulp-autoprefixer');
const babel          = require('gulp-babel');

function img () {
  return gulp.src('./src/images/**/*') // Берем все изображения из src
      .pipe(imagemin({ // Сжимаем их с наилучшими настройками
          optimizationLevel: 5,
          interlaced: true,
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()]
      }))
      .pipe(gulp.dest('./dist/images'));
};

function browserS () {
  browserSync({
      server: './',
      directory: true,
      index: "index.html",
      notify: false
  });
};

function html () {
    return gulp.src('./src/*.html')
        .pipe(include({
            prefix: '@@',
            basepath: './src/modules/'
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.reload({stream: true}))
}

function fonts () {
  return gulp.src('./src/fonts/**/*.*')
  .pipe(gulp.dest('./dist/fonts'));
};


function scripts () {
  return gulp.src("./src/js/*.js")
      .pipe(sourcemaps.init())
      .pipe(babel({presets: ['@babel/env']}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest("./dist/js"))
      .pipe(browserSync.reload({stream: true}));
};

function css() {
        return gulp.src('./src/styles/**/*.{scss, sass}')
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(autoprefixer({
                cascade: false
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./dist/css'))
            .pipe(browserSync.reload({stream: true}));
    };


const clean = (done) => {del.sync('dist'); done()};

const build = gulp.series(clean, html, gulp.parallel(css, fonts, scripts, img));

// function watch() {
//
// }
const watch = gulp.parallel(build, browserS, (done) => {
    gulp.watch('./src/**/*.html', html);
    gulp.watch('./src/styles/*.{scss, sass}', css);
    gulp.watch('./src/js/**/*.js', scripts);
    done();
})

exports.clean = clean;
exports.css = css;
exports.fonts = fonts;
exports.scripts = scripts;
exports.html = html;
exports.img = img;
exports.browserS = browserS;
exports.build = build;

exports.default = watch;