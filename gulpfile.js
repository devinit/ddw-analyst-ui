'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const { series, src } = require('gulp');
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

function build(cb) {
  src('frontend/src/index.ts').pipe(webpackStream(webpackConfigProduction, webpack));

  cb();
}

function dev(cb) {
  src('frontend/src/index.ts').pipe(webpackStream(webpackConfig, webpack));

  cb();
}

exports.build = series(cleaning, build);
exports.default = series(cleaning, dev);
