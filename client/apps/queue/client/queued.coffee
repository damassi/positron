_ = require 'underscore'
React = require 'react'
{ div } = React.DOM
ArticleList = require '../../../components/article_list/index.coffee'

module.exports = QueuedArticles = React.createClass

  selected: (article) ->
    @props.selected article, 'unselect'

  render: ->
    div { className: 'queued-articles__container' },
      div { className: 'queued-articles__header-container' },
        div { className: 'queued-articles__header-text' }, @props.headerText
      ArticleList {
        articles: @props.articles
        checkable: true
        selected: @props.selected
      }