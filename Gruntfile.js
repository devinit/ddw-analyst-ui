'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpack-merge');
const webpackConfig = require('./webpack.config');

const webpackConfigProduction = merge(webpackConfig, {
  devtool: false,
  mode: 'production',
  watch: false,
});

module.exports = function (grunt) {
  grunt.initConfig({
    webpack: {
      develop: webpackConfig,
      release: webpackConfigProduction,
    },

    clean: {
      static: {
        src: ['./frontend/static/frontend/css/*', './frontend/static/frontend/js/*'],
      },
    },

    checkDependencies: {
      this: {},
    },

    exec: {
      collectstatic: {
        command: 'npm run collectstatic',
      },
      dockercollectstatic: {
        command: 'npm run docker:collectstatic',
      },
    },
  });

  grunt.loadNpmTasks('grunt-check-dependencies');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', ['clean build', 'exec:collectstatic', 'webpack:develop']);
  grunt.registerTask(
    'clean build',
    'Compiles all the frontend assets and copies the files to the frontend/static directory.',
    ['checkDependencies', 'clean:static', 'webpack:develop'],
  );
  grunt.registerTask(
    'release',
    'Compiles all the frontend assets and copies the files to the frontend/static directory. Minified without source mapping', // tslint:disable-line
    ['checkDependencies', 'clean:static', 'webpack:release', 'exec:dockercollectstatic'],
  );
  grunt.registerTask('build', ['clean build']);
};
