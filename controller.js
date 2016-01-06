// controller.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

var garageState = ''
var connected = false

client.on('connect', () => {
  client.subscribe('garage/connected')
  client.subscribe('garage/state')
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'garage/connected':
      return handleGarageConnected(message)
    case 'garage/state':
      return handleGarageState(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleGarageConnected (message) {
  console.log('garage connected status %s', message)
  connected = (message.toString() === 'true')
}

function handleGarageState (message) {
  garageState = message
  console.log('garage state update to %s', message)
}

function openGarageDoor () {
  // can only open door if we're connected to mqtt and door isn't already open
  if (connected && garageState !== 'open') {
    // Ask the door to open
    client.publish('garage/open', 'true')
  }
}

function closeGarageDoor () {
  // can only close door if we're connected to mqtt and door isn't already closed
  if (connected && garageState !== 'closed') {
    // Ask the door to close
    client.publish('garage/close', 'true')
  }
}

// --- For Demo Purposes Only ----//

// simulate opening garage door
setTimeout(() => {
  console.log('open door')
  openGarageDoor()
}, 5000)

// simulate closing garage door
setTimeout(() => {
  console.log('close door')
  closeGarageDoor()
}, 20000)
