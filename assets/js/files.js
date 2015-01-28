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
  model: new FileList(),

  tagName: 'div',

  initialize: function () {
    this.template = _.template($('#file-template').html())
    this.model.fetch()
  },

  events: { 
    "click .toggle": "toggleDone"
  },

  toggleDone: function () { 
    this.model.save({
      success:function() {
        console.log('saved tweet to db')
      },
      error:function () {
        console.log('failed to save db')
      }
    })  
  }
})


$(document).ready(function () {
	var appview = new FileView();
});

