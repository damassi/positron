Q = require 'bluebird-q'
mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
moment = require 'moment'
debug = require('debug') 'scripts'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.update(
  { scheduled_publish_at: { $lt: new Date() } }
  { 
    $set: {
      published: true
      published_at: Date()
      scheduled_publish_at: null 
    } 
  }
  { multi: true }
  (err, msg) ->
    return exit err if err
    debug 'Scheduled publication finished', msg
    process.exit()
)

exit = (err) ->
  console.error "ERROR", err
  process.exit true