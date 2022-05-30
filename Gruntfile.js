const webpackConfig = require('./webpack.config.js');
const { merge } = require('webpack-merge');

const webpackConfigProduction = merge(webpackConfig, {
  devtool: false,
  mode: 'production',
  watch: false,
});

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      contents: ['frontend/static/frontend/css/*', 'frontend/static/frontend/js/*'],
    },
    webpack: {
      prod: webpackConfigProduction,
      dev: webpackConfig,
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-webpack');

  grunt.task.registerTask('default', 'Run the default task', ['clean', 'webpack:dev']);
  grunt.task.registerTask('build', 'Run production build', ['clean', 'webpack:prod']);
};
