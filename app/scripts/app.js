/** @jsx React.DOM */

var Physics = require('rk4')
  , Renderer = require('rk4/lib/renderer')
  , Velocity = require('touch-velocity')
  , Vector = window.Vector = require('rk4/lib/vector')
  , Promise = Promise || require('promise')
  , EventEmitter = require('events')
  , height = $(window).height()

var opts = { b: 10, k: 100 }
function List(els) {
  var listItems = this.listItems = []
    , listItem

  for(var i = 0 ; i < els.length ; i++) {
    listItems.push(new ListItem(els[i], i))
  }

  var startY
    , currentPosition = 0
    , lastPosition = 0
    , velo
    , dist

  var that = this
  this.phys = new Physics(function(pos) {
    currentPosition = pos.y
    var delta = currentPosition - lastPosition
    that.spring.setPosition({ x: 0, y: that.itemPhys.position.y + delta })
    lastPosition = currentPosition
  })

  this.itemPhys = new Physics(function(pos) {
    if(typeof startY === 'undefined') return
    listItems.forEach(function(listItem) {
      var dist = startY - listItem.topOffset
        , scrollHardness = -Math.max(Math.abs(dist / 800), 0)
        , springPosition = scrollHardness * pos.y

      listItem.scroll(currentPosition, springPosition)
    })
  })
  this.spring = this.itemPhys.infiniSpring(0, { x: 0, y: 0 }, opts)

  window.addEventListener('touchstart', function(evt) {
    that.phys.cancel()
    startY = evt.touches[0].pageY - currentPosition
    velo = new Velocity
  })

  window.addEventListener('touchmove', function(evt) {
    evt.preventDefault()
    currentPosition = evt.touches[0].pageY - startY
    var delta = currentPosition - lastPosition

    that.spring.setPosition({ x: 0, y: that.itemPhys.position.y + delta })

    velo.updatePosition(currentPosition)
    lastPosition = currentPosition
  })

  window.addEventListener('touchend', function(evt) {
    var velocity = velo.getVelocity()
    if(velocity <= 0) {
      var top = height - (listItems[listItems.length - 1].topOffset + 20)
      that.phys.decelerate(velocity, { x: 0, y: currentPosition }, { x: 0, y: top }, { acceleration: 1000 })
    } else {
      that.phys.decelerate(velocity, { x: 0, y: currentPosition }, { x: 0, y: 0 }, { acceleration: 1000 })
    }
  })
}

var list = new List(document.querySelectorAll('.messages > div'))

var springs = 0

function ListItem(el, i) {
  this.el = el
  this.topOffset = $(el).offset().top
  this.lastPosition = this.topOffset

  var that = this

  setTimeout(function() {
    $(el).css({
      top: '0px',
      left: '0px',
      position: 'absolute'
    })
    that.renderer.update({ y: that.lastPosition })
  }, 20)


  this.renderer = new Renderer([el])
    .style('translateY', function(pos) { return pos.y + 'px' })
    .visible(function(pos) { return pos.y > height + 5 || pos.y + 50 < 0 })

  var that = this
}

ListItem.prototype.scroll = function(currentPosition, springPosition) {
  currentPosition = currentPosition + this.topOffset
  this.renderer.update({ y: currentPosition + springPosition })
  this.lastPosition = currentPosition
}

ListItem.prototype = new EventEmitter()
var logged = false