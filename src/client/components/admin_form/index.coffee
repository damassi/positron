Backbone = require 'backbone'
ImageUploadForm = require '../image_upload_form/index.coffee'
ImageVideoUploadForm = require '../image_video_upload_form/index.coffee'
propByString = require 'prop-by-string'

module.exports.AdminEditView = class AdminEditView extends Backbone.View

  initialize: ({ @onDeleteUrl }) ->
    @attachUploadForms()

  attachUploadForms: ->
    @$('.admin-image-placeholder').each (i, el) =>
      if $(el).attr('data-type') == 'video'
        new ImageVideoUploadForm
          el: $(el)
          src: propByString.get $(el).attr('data-name'), @model.attributes
          name: $(el).attr('data-name')
      else
        new ImageUploadForm
          el: $(el)
          src: propByString.get $(el).attr('data-name'), @model.attributes
          name: $(el).attr('data-name')

  events:
    'click .admin-form-delete': 'destroy'
    'change :input': 'unsaved'
    'submit form': 'ignoreUnsaved'

  destroy: (e) ->
    e.preventDefault()
    return unless confirm "Are you sure you want to delete this?"
    @model.destroy success: => location.assign @onDeleteUrl

  unsaved: ->
    window.onbeforeunload = ->
      "You have unsaved changes, do you wish to continue?"

  ignoreUnsaved: ->
    window.onbeforeunload = ->

module.exports.init = ->
  new AdminEditView
    el: $('body')