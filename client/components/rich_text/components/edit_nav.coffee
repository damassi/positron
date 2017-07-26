React = require 'react'
_ = require 'underscore'
{ div, button } = React.DOM
icons = -> require('../utils/icons.jade') arguments...

module.exports = React.createClass
  displayName: 'Nav'

  onToggle: (e) ->
    e.preventDefault()
    name = if e.target.name then e.target.name else $(e.target).closest('button').attr('name')
    if name in _.pluck(@props.blocks, 'name')
      @props.toggleBlock name
    else if name in _.pluck(@props.styles, 'name')
      @props.toggleStyle name
    else if name is 'link'
      @props.promptForLink()
    else if name is 'artist'
      @props.promptForLink name
    else if name is 'remove-formatting'
      @props.makePlainText

  getButtonsArray: ->
    buttons = []
    buttons.push @props.styles if @props.styles
    buttons.push @props.blocks if @props.blocks
    if @props.promptForLink
      buttons.push({name: 'link'})
    if @props.hasFeatures
      buttons.push({name: 'artist'})
    if @props.makePlainText
      buttons.push({name: 'remove-formatting'})
    buttons = _.flatten(buttons)

  render: ->
    width = if @getButtonsArray().length is 10 then 250 else 200
    div {
      className: 'rich-text--edit-nav'
      style:
        top: @props.position?.top
        marginLeft: @props.position?.left
        width: width
    },
      @getButtonsArray().map (type, i) =>
        if type.label
          button {
            key: i
            onMouseDown: @onToggle
            name: type.name
            className: type.name
          }, type.label
        else
          button {
            key: i
            onMouseDown: @onToggle
            name: type.name
            className: type.name
            dangerouslySetInnerHTML: __html: $(icons()).filter('.' + type.name).html()
          }

