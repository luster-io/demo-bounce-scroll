/** @jsx React.DOM */

var Physics = require('impulse')
  , listContainer = document.querySelector('.messages')
  , listItems = document.querySelectorAll('.messages > div')
  , height = window.innerHeight

var boundry = new Physics.Boundry({
  top: -($(listContainer).height() - window.innerHeight),
  bottom: 0,
  left: 0,
  right: 0
})

var damping = 0.25

function List(listContainer, listItems) {
  var that = this
  var currentPosition = 0
  this.phys = new Physics(function(x, y) {
    var lastPosition = currentPosition
      , delta

    currentPosition = y
    delta = currentPosition - lastPosition

    listItems.forEach(function(item, i) {
      var dist = (boundry.top + that.startY) - item.offset
        , scrollHardness = -Math.abs(dist / 600)
        , position = item.spring.position().y + delta * scrollHardness

      if(dist > 0 && delta < 0 && position > 0) {
        position = 0
      }
      if(dist < 0 && delta > 0 && position < 0) {
        position = 0
      }
      item.spring.position(0, position)
    })
  })

  listItems = [].slice.call(listItems)
  listItems = listItems.map(function(el, i) {
    var offset = boundry.top + $(el).position().top
    var phys = new Physics(el)
      .style('translateY', function(x, y) { return currentPosition + y + 'px' })
      .visible(function(pos) {
        var position = pos.y + currentPosition
        return (position + offset < boundry.top + height) && (position + offset + 50 > boundry.top)
      })

    var spring = phys.attachSpring(function() { return { x: 0, y: 0 } }, { tension: 200, damping: 30 })
    spring.start()

    return {
      spring: spring,
      offset: offset
    }
  })

  listContainer.addEventListener('touchstart', function(evt) {
    that.startY = evt.touches[0].pageY - that.phys.position().y
    that.interaction = that.phys.interact()
    that.interaction.start()
  })

  listContainer.addEventListener('touchmove', function(evt) {
    evt.preventDefault()
    var delta
      , currentPosition = evt.touches[0].pageY - that.startY

    if(currentPosition < boundry.top)
      currentPosition = boundry.top - ((boundry.top - currentPosition) * damping)

    if(currentPosition > boundry.bottom)
      currentPosition = boundry.bottom - ((boundry.bottom - currentPosition) * damping)

    that.interaction.position(0, currentPosition)
  })

  listContainer.addEventListener('touchend', function(evt) {
    that.interaction.end()
    var position = that.phys.position().y

    if(that.phys.direction('up') || position < boundry.top) end = { x: 0, y: boundry.top }
    else if(that.phys.direction('down') || position > boundry.bottom) end = { x: 0, y: boundry.bottom }

    if(end) {
      if(boundry.contains({ x: 0, y: position })) {
        that.phys.decelerate({ deceleration: 1000 }).to(end).start()
          //.then(that.phys.spring({ tension: 200, damping: 30 }).start)
      } else {
        that.phys.spring({ tension: 200, damping: 30 }).to(end).start()
      }
    }
  })
}

var list = new List(listContainer, listItems)