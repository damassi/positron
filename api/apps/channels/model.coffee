#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "channels" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL, API_MAX, API_PAGE_SIZE } = process.env

#
# Schemas
#
schema = (->
  id: @objectId()
  name: @string().allow('', null)
  user_ids: @array().items(@objectId()).default([])
).call Joi

querySchema = (->
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
).call Joi

#
# Retrieval
#
@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) }
  db.channels.findOne query, callback

@where = (input, callback) ->
  Joi.validate input, querySchema, (err, input) =>
    return callback err if err
    query = _.omit input, 'limit', 'offset'
    cursor = db.channels
      .find(query)
      .limit(input.limit)
      .sort($natural: -1)
      .skip(input.offset)
    async.parallel [
      (cb) -> cursor.toArray cb
      (cb) -> cursor.count cb
      (cb) -> db.channels.count cb
    ], (err, [channels, count, total]) =>
      callback err, {
        total: total
        count: count
        results: channels.map(@present)
      }

#
# Persistence
#
@save = (input, callback) ->
  Joi.validate input, schema, (err, input) =>
    return callback err if err
    data = _.extend _.omit(input, 'id'),
      _id: ObjectId(input.id)
      # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
      user_ids: input.user_ids.map(ObjectId) if input.user_ids
    db.channels.save data, callback

@destroy = (id, callback) ->
  db.channels.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@present = (channel) =>
  _.extend
    id: channel?._id?.toString()
  , _.omit(channel, '_id')