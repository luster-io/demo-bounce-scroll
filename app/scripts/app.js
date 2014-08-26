var Physics = require('impulse')

var damping = 0.25

function List(listContainer, listItems) {

  var boundry = new Physics.Boundry({
    top: -($(listContainer).height() - window.innerHeight + 43),
    bottom: 0,
    left: 0,
    right: 0
  })

  var height = window.innerHeight
  var that = this
  var currentPosition = 0
  listItems = [].slice.call(listItems)
  this.phys = new Physics(function(x, y) {
    var lastPosition = currentPosition
      , delta

    currentPosition = y
    delta = currentPosition - lastPosition

    listItems.forEach(function(item, i) {
      var dist = (boundry.top + that.startY) - item.offset
        , scrollHardness = Math.abs(dist / 1500)
        , position = item.spring.position().y

      if(delta < 0) {
        position -= Math.max(delta, delta * scrollHardness)
      } else {
        position -= Math.min(delta, delta * scrollHardness)
      }

      item.spring.position(0, position)
    })

    //poor mans collision detection!
    listItems.forEach(function(item, i) {
      var dist = (boundry.top + that.startY) - item.offset
        , next = listItems[i + 1]
        , prev = listItems[i - 1]
        , position = item.spring.position().y
      if(next && dist > 0 && delta < 0 && position > next.spring.position().y) {
        item.spring.position(0, next.spring.position().y)
      }
      if(prev && dist < 0 && delta > 0 && position < prev.spring.position().y) {
        item.spring.position(0, prev.spring.position().y)
      }
    })
  })

  listItems = [].slice.call(listItems)
  listItems = listItems.map(function(el, i) {
    var offset = boundry.top + $(el).position().top
    var message = new Physics(el)
      .style('translateY', function(x, y) { return currentPosition + y + 'px' })

    var t = 400
    var spring = message.attachSpring(function() { return { x: 0, y: 0 } }, { tension: t, damping: t * .2 })
    spring.start()

    return {
      spring: spring,
      offset: offset
    }
  })
  this.phys.position(0, boundry.top)

  var drag = this.phys.drag({ handle: listContainer, boundry: boundry, direction: 'vertical' })

  drag.on('start', function(evt) {
    that.startY = (evt.touches && evt.touches[0].pageY || evt.pageY) - that.phys.position().y
  })

  drag.on('end', function(evt) {
    var position = that.phys.position().y

    if(that.phys.direction('up') || position < boundry.top) end = { x: 0, y: boundry.top }
    else if(that.phys.direction('down') || position > boundry.bottom) end = { x: 0, y: boundry.bottom }

    if(end) {
      if(boundry.contains({ x: 0, y: position })) {
        that.phys.decelerate({ deceleration: 1000 }).to(end).start()
          .then(that.phys.spring({ tension: 120, damping: 24 }).start)
      } else {
        that.phys.spring({ tension: 150, damping: 24 }).to(end).start()
      }
    }
  })
}

$(function() {
  var listContainer = document.querySelector('.messages')
    , listItems = document.querySelectorAll('.messages > div')
    , list = new List(listContainer, listItems)
})
