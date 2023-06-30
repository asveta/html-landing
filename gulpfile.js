"use strict";

const {src, dest} = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const panini = require("panini");
const del = require("del");
const notify = require("gulp-notify");
const webpackStream = require('webpack-stream');
const browserSync = require("browser-sync").create();
const ssh = require('gulp-ssh');


/* Paths */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html:   distPath,
        js:     distPath + "assets/js/",
        css:    distPath + "assets/css/",
        images: distPath + "assets/images/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        js:     srcPath + "assets/js/*.js",
        css:    srcPath + "assets/scss/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html:   srcPath + "**/*.html",
        js:     srcPath + "assets/js/**/*.js",
        css:    srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts:  srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
}



/* Tasks */

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    });
}

function html(cb) {
    panini.refresh();
    return src(path.src.html, {base: srcPath})
        .pipe(plumber())
        .pipe(panini({
            root:       srcPath,
            layouts:    srcPath + 'layouts/',
            partials:   srcPath + 'partials/',
            helpers:    srcPath + 'helpers/',
            data:       srcPath + 'data/'
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function css(cb) {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(autoprefixer({
            cascade: true
        }))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function cssWatch(cb) {
    return src(path.src.css, {base: srcPath + "assets/scss/"})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "SCSS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function js(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
          mode: "production",
          output: {
            filename: 'app.js',
          }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function jsWatch(cb) {
    return src(path.src.js, {base: srcPath + 'assets/js/'})
        .pipe(plumber({
            errorHandler : function(err) {
                notify.onError({
                    title:    "JS Error",
                    message:  "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
          mode: "development",
          output: {
            filename: 'app.js',
          }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function images(cb) {
    return src(path.src.images)
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function fonts(cb) {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({stream: true}));

    cb();
}

function clean(cb) {
    return del(path.clean);

    cb();
}



// Define the SSH configuration for your remote web server
const sshConfig = {
    host: 'asveta.by',
    port: 22,
    username: 'asvetaby',
    password: 'iSoh8yib'
};

// Define the path to the build directory
const buildDir = './dist';

// Define the path to the remote directory on the web server
const remotePath = '/home/asvetaby/public_html';

// Define a deployment task that deploys the contents of the build directory to the remote web server
function deploy() {

    // Create an SSH client using the SSH configuration
    const sshClient = ssh(sshConfig);

    // Define the source files to deploy
    const sourceFiles = [
        `${buildDir}/**/*`
    ];

    // Use the SSH client to upload the source files to the remote web server
    return gulp.src(sourceFiles)
        .pipe(sshClient.dest(remotePath));
}

// Define a task to clean up the remote directory on the web server
function cleanRemote(cb) {

    // Create an SSH client using the SSH configuration
    const sshClient = ssh(sshConfig);

    // Use the SSH client to run a command to delete the contents of the remote directory
    return sshClient.shell(['rm -rf ' + remotePath + '/*']);

    cb();
}

// Define a task to clean up the build directory
function cleanLocal() {
    return del(buildDir);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], cssWatch);
    gulp.watch([path.watch.js], jsWatch);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, serve);



/* Exports Tasks */
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;

exports.deploy = deploy;
exports.cleanRemote = cleanRemote;
exports.cleanLocal = cleanLocal;
