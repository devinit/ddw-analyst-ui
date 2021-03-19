'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const { series, src, watch } = require('gulp');
const clean = require('gulp-clean');

function cleaning(cb) {
  ['frontend/static/frontend/css/*', 'frontend/static/frontend/js/*'].forEach((_path) => {
    src(_path, { read: false }).pipe(clean());
  });

  cb();
}

function build(cb) {
  // TODO: add cleaning tasks here
  console.log('Building ...');

  cb();
}

exports.build = build;
exports.default = series(cleaning, build);
