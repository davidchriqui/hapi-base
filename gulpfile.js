'use strict'

// env variables read from this file take precedence over the .env file
if (process.env.NODE_ENV) {
  require('dotenv').config({
    path: `.${process.env.NODE_ENV}.env`,
    silent: true
  })
}
require('dotenv').config({silent: true})

const gulp = require('gulp')
const env = require('gulp-env')
const $ = require('gulp-load-plugins')()
require('babel-register')

gulp.task('serve', () => {
  $.nodemon({
    script: 'src/index.js',
    execMap: {js: '$(npm bin)/babel-node'},
    ignore: ['gulpfile.js', 'node_modules/']
  })
})

// Batch Capture Auto
gulp.task('capture_auto', () => {
  const CaptureAuto = require('./src/batchs/capture_auto')
  return CaptureAuto.default.execute()
    .then(_ => process.exit())
    .catch(err => console.error(err))
})

gulp.task('test', () => {
  const argv = require('yargs').argv
  const envs = env.set({ NODE_ENV: 'test', PORT: 0 })
  return gulp
    .src([
      'test/batchs/**/*.js',
      'test/db/**/*.js',
      'test/lib/**/*.js',
      'test/models/**/*.js',
      'test/routes/**/*.js',
      'test/utils/**/*.js'
    ], {read: false})
    .pipe(envs)
    .pipe($.mocha({ slow: 100, grep: argv.grep }))
    .once('end', () => process.exit())
})

gulp.task('default', ['build'])

gulp.task('fixtures', (fn) => {
  const env = require('./src/lib/env')
  const databaseURL = env('DATABASE_URL')
  const sqlFixtures = require('sql-fixtures')

  sqlFixtures.create(databaseURL, require('./test/fixtures'), (err, result) => {
    // at this point a row has been added to the users table
    if (err) console.error(err)
    fn()
    process.exit()
  })
})
