var Backbone = require('backbone')
  , $ = require('jquery')  
  , _ = require('underscore')

window.$ = window.jQuery = Backbone.$ = $

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
  model: new File(),
  tagName: 'li',
  template: _.template($('#file-template').html()),
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

