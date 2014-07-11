/** @jsx React.DOM */

var Physics = require('rk4')
  , Renderer = require('rk4/lib/renderer')
  , Velocity = require('touch-velocity')
  , Vector = window.Vector = require('rk4/lib/vector')
  , Promise = Promise || require('promise')
  , EventEmitter = require('events')

function List(els) {
  var listItems = []
    , listItem
  for(var i = 0 ; i < els.length ; i++) {
    listItem = new ListItem(els[i])
    if(listItems[i - 1]) {
      listItem.setPrev(listItems[i - 1])
      listItems[i - 1].setNext(listItem)
    }
    listItems.push(listItem)
  }
}

function ListItem(el) {
  this.next = null
  this.prev = null
  this.el = el
  this.currentPosition = Vector(0, 0)

  this.renderer = new Renderer([el])
    .style('translateY', function(pos) { console.log(pos.y); return pos.y + 'px' })

  this.phys = new Physics(this.renderer.update.bind(this.renderer))
}

ListItem.prototype = new EventEmitter()

var opts = { b: 10, k: 100, seperation: 50 }

ListItem.prototype.setPrev = function(prev) {
  this.prev = prev
  this.phys.attachSpring(0, { x: 0, y: 0 }, this.prev.phys, opts)
}

ListItem.prototype.setNext = function(next) {
  this.next = next
  this.phys.attachSpring(0, { x: 0, y: 0 }, this.next.phys, opts)
}

var list = new List([].slice.call(document.querySelectorAll('.message')))
