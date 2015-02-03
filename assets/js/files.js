var Backbone = require('backbone')
  , _ = require('underscore')
  , $ = require('jquery')

window.$ = Backbone.$ = $

var File = Backbone.Model.extend({
  defaults: function() {
    return {
      title: '',
      id: '',
      type: '',
      link: '',
    }
  }
})

var FileList = Backbone.Collection.extend({
  model: File,
  url: '/all'
})

var FileView = Backbone.View.extend({

  initialize: function () {
    // Compile the template
    this.template = _.template($('#file-template').html())
  },

  render: function () {
    // The model is a SINGLE file. Send it into the template, and append it to this dom node
  console.log(this.model.toJSON())
    this.$el.html(this.template(this.model.toJSON()))
    return this
  },

  events: {
    "click" : "graph"
  },

  graph: function () { 
    var _this = this
    $.ajax({ 
      url: "/id",
      type: 'POST',
      data: {link: _this.model.get(
        'links')},
      success: function (data, stat) { 
        console.log(JSON.stringify(data))
      },
      error: function () { 
        console.log(arguments)
      } 
    })
  }

})

var FilesView = Backbone.View.extend({
  el: $('#FilesContainer'),
  initialize: function () {
    this.files = new FileList

    // listen to add events on the collection. when one is fired, call add.
    this.listenTo(this.files, 'add', this.add, this)
  },

  // This is called for each file that's fetched
  add: function (file) {
    // Build a file view, and append it into the files list container
    var fv = new FileView({ 
      model: file
    })

    this.$el.append(fv.render().el)
  },

  render: function () {
    this.files.fetch()
    return this
  }


})
$(document).ready(function () {
  // Build the view that will list the files
	var appview = new FilesView();

  // Render it and add it to the dom
  $('#FilesContainer').append(appview.render().el)
});

