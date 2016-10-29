import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
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
    const myConfig = Object.create(WebpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;
    myConfig.entry.app.unshift('webpack-dev-server/client?http://localhost:8080/');
    const compiler = webpack(myConfig);

    const server = new WebpackDevServer(compiler, {
      publicPath: myConfig.output.publicPath,
      stats: { colors: true }
    }).listen(8080, 'localhost', function(err) {
      cb();
    });
  });

gulp.task('webpack:build-prod', (cb) => {
  const myConfig = Object.create(WebpackConfig);
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
  const myDevConfig = Object.create(WebpackConfig);
  myDevConfig.devtool = "sourcemap";
  myDevConfig.debug = true;

  const devCompiler = webpack(myDevConfig);

  devCompiler.run(function(err, stats) {
    console.log(err);
    cb();
  });
});

gulp.task('webpack:watch-dev', (cb) => {
  const myDevConfig = Object.create(WebpackConfig);
  myDevConfig.devtool = 'inline-source-map';
  myDevConfig.debug = true;

  const devCompiler = webpack(myDevConfig);

  devCompiler.watch({}, function(err, stats) {
    if (err) console.error(err);
    console.log('Built');
  });
});

gulp.task('dev', ['webpack:build-dev', 'rebuild-css']);
gulp.task('build', ['copy', 'css', 'webpack:build-prod', 'watch-css']);
