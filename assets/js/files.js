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
  model: new File(),

  tagName: 'div',

  initialize: function () {
    this.template = _.template($('#file-template').html())
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

var FilesView = Backbone.View.extend({ 
  model: new FileList(), 
  el: $('#FilesContainer'), 
  initialize: function () { 
    this.model.fetch({
      success: function(item){
        console.log(item)
        this.render(item) 
      }  
    })
  },
  render: function ()
  

})
$(document).ready(function () {
	var appview = new FileView();
});

