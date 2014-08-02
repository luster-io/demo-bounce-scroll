/** @jsx React.DOM */

var Physics = require('rk4')
  , listContainer = document.querySelector('.messages')
  , listItems = document.querySelector('.messages > div')
  // , dist = startY - listItem.topOffset
  // , scrollHardness = -Math.max(Math.abs(dist / 800), 0)

var boundry = new Physics.Boundry({
  top: -($(listContainer).height() - window.innerHeight),
  bottom: 0,
  left: 0,
  right: 0
})

var damping = 0.25

function List(listContainer, listItems) {
  var that = this
  this.phys = new Physics(listContainer)
    .style('translateY', function(pos) { return pos.y + 'px' })

  listContainer.addEventListener('touchstart', function(evt) {
    that.startY = evt.touches[0].pageY - that.phys.position().y
    that.interaction = that.phys.interact()
    that.interaction.start()
  })

  listContainer.addEventListener('touchmove', function(evt) {
    evt.preventDefault()
    currentPosition = evt.touches[0].pageY - that.startY

    if(currentPosition < boundry.top)
      currentPosition = boundry.top - ((boundry.top - currentPosition) * damping)

    if(currentPosition > boundry.bottom)
      currentPosition = boundry.bottom - ((boundry.bottom - currentPosition) * damping)

    that.interaction.position(0, currentPosition)
  })

  listContainer.addEventListener('touchend', function(evt) {
    that.interaction.end()
    var velocity = that.phys.velocity()
    var position = that.phys.position().y

    if(that.phys.direction('up') || position < boundry.top) end = { x: 0, y: boundry.top }
    if(that.phys.direction('down') || position > boundry.bottom) end = { x: 0, y: boundry.bottom }

    if(boundry.contains({ x: 0, y: position })) {
      that.phys.decelerate({ deceleration: 1000 })
        .to(end).start()
        .then(that.phys.spring({ tension: 200, damping: 30 }).start)
    } else {
      that.phys.spring({ tension: 200, damping: 30 }).to(end).start()
    }
  })
}

var list = new List(listContainer)