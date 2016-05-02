import gulp from 'gulp';
// import debug from 'gulp-debug';
import sourcemaps from 'gulp-sourcemaps';
// import rev from 'gulp-rev';
// import awspublish from 'gulp-awspublish';
// import notify from 'gulp-notify';
import { argv } from 'yargs';
import del from 'del';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import WebpackConfig from './webpack.config';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
const isDevMode = argv.dev;
const publicSrc = './public';
const dist = './dist';

gulp.task('clean', () => del(dist));
gulp.task('copy', ['clean'], () => (
  gulp.src([
    `${publicSrc}/**/*.{eot,svg,ttf,woff,woff2,jpg,png,mp4}`
  ])
  .pipe(gulp.dest(dist))
));

function buildCSS() {
  return gulp.src(`${publicSrc}/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer,
      cssnano({ zindex: false })
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${dist}`));
}
gulp.task('css', ['clean'], buildCSS);
gulp.task('rebuild-css', buildCSS);
gulp.task('watch-css', () => {
  if (isDevMode) gulp.watch(`${publicSrc}/**/*.scss`, ['rebuild-css']);
});

gulp.task('webpack:dev', (cb) => {
    var myConfig = Object.create(WebpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;
    myConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:8080/');
    const compiler = webpack(myConfig);

    new WebpackDevServer(compiler, {
        publicPath: myConfig.output.publicPath,
        stats: { colors: true }
      }).listen(8080, 'localhost', function(err) {
        cb();
      });
  });

gulp.task('webpack:build-prod', (cb) => {
  var myConfig = Object.create(WebpackConfig);
  myConfig.plugins = myConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );

  webpack(myConfig, function(err, stats) {
    cb();
  });
});

gulp.task('webpack:build-dev', (cb) => {
  var myDevConfig = Object.create(WebpackConfig);
  myDevConfig.devtool = "sourcemap";
  myDevConfig.debug = true;


  // const plugins = [new webpack.optimize.UglifyJsPlugin({
  //     sourceMap: false,
  //     compress: {
  //       warnings: false
  //     }
  //   })];

  var devCompiler = webpack(myDevConfig);

  devCompiler.run(function(err, stats) {
    cb();
  });
});

  // gulp.task('file-rev', ['css', 'webpack'], () => (
  //   gulp.src('./dist#<{(||)}>#*.{js,css}')
  //     .pipe(rev())
  //     .pipe(debug())
  //     .pipe(gulp.dest('build'))
  //     .pipe(rev.manifest())
  //     .pipe(gulp.dest('build'))
  // ));

gulp.task('dev', ['webpack:dev']);
gulp.task('build', ['copy', 'css', 'webpack:build-prod', 'watch-css']);
