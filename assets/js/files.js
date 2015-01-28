var Backbone = require('backbone')
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

  tagName: 'li',

  initialize: function (){
    this.template = _.template($('#file-template').html())
    FileList.fetch({
      success: function () { 
        console.log('suxess')
      },
      error: function () {
        console.log('error')
      } 
    })
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

