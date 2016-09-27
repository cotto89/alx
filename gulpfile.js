/* eslint-disable import/no-extraneous-dependencies */
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const ava = require('gulp-ava');
const notify = require('gulp-notify');
const cached = require('gulp-cached');
const env = require('gulp-process-env');

const PATH = {
    test: 'test/**/**.test.js'
};

const noticeError = (err) => {
    notify.onError({ message: '<%= error.plugin %>' })(err);
};

gulp.task('test', () => gulp.src(PATH.test)
    .pipe(env({ NODE_ENV: 'test' }))
    .pipe(cached('ava'))
    .pipe(plumber(noticeError))
    .pipe(ava())
).watch(PATH.test, ['test']);
