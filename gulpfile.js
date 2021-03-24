'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const { dest, series, src } = require('gulp');
const clean = require('gulp-clean');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const { merge } = require('webpack-merge');
const webpackConfig = require('./webpack.config');

const webpackConfigProduction = merge(webpackConfig, {
  devtool: false,
  mode: 'production',
  watch: false,
});

function cleaning(cb) {
  ['frontend/static/frontend/css/*', 'frontend/static/frontend/js/*'].forEach((_path) => {
    src(_path, { read: false }).pipe(clean());
  });

  cb();
}

function building() {
  return src('frontend/src/index.ts')
    .pipe(webpackStream(webpackConfigProduction, webpack))
    .pipe(dest(webpackConfig.output.path));
}

function dev() {
  return src('frontend/src/index.ts')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(dest(webpackConfig.output.path));
}

exports.build = series(cleaning, building);
exports.default = series(cleaning, dev);
