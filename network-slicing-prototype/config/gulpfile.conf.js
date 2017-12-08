// ```
// gulpfile.conf.js
// (c) 2016 David Newman
// david.r.niciforovic@gmail.com
// gulpfile.conf.js may be freely distributed under the MIT license
// ```

// *gulpfile.js*

// Import gulp packages
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import scsslint from 'gulp-scss-lint';


// Define `JavaScript` files to watch/ignore
let jsGlob = ['**/*.js', '!{node_modules,node_modules/**}'];

// Define `TypeScript` files to watch/ignore
let tsGlob = ['**/*.ts', '!{node_modules,node_modules/**}'];

// Define `Sass` files to watch/ignore
let scssGlob = ['**/*.scss', '!{node_modules,node_modules/**}'];

// Create the default task and have it clear out all existing
// documentation; watch all neccessary files for automatic
// documentation generation as well as linting all `sass` styles.
gulp.task('default', ['watch:sass']);

// Watch `Sass` files for changes and lint
gulp.task('watch:sass', () => {

  gulp.watch(scssGlob, function (event) {
    return gulp.src(event.path)
      .pipe(scsslint());
  });
});


// Sugar for `gulp serve:watch`
gulp.task('serve', ['serve:watch']);

// Configure gulp-nodemon
// This watches the files belonging to the app for changes
// and restarts the server whenever a change is detected
gulp.task('serve:watch', () => {

  nodemon({
    script : 'server.js',
    ext : 'js',
    watch: ['app', 'server.conf.js']
  });
});

