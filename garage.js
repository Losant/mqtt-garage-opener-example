// garage.js
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

/**
 * The state of the garage, defaults to closed
 * Possible states : closed, opening, open, closing
 */
var state = 'closed';

client.on('connect', function () {
  client.subscribe('garage/open');
  client.subscribe('garage/close');

  // Inform controllers that garage is connected
  client.publish('garage/connected', 'true');
  sendStateUpdate();
});

client.on('message', function(topic, message) {
  console.log('received message %s %s', topic, message);
  switch (topic) {
    case 'garage/open':
      return handleOpenRequest(message);
      break;
    case 'garage/close':
      return handleCloseRequest(message);
      break;
  }
});

function sendStateUpdate() {
  console.log('sending state %s', state);
  client.publish('garage/state', state);
}

function handleOpenRequest(message) {
  if(state !== 'open' && state !== 'opening') {
    console.log('opening garage door');
    state = 'opening';
    sendStateUpdate();

    // simulate door open after 5 seconds (would be listening to hardware)
    setTimeout(function() {
      state = 'open';
      sendStateUpdate();
    }, 5000);
  }
}

function handleCloseRequest(message) {
  if(state !== 'closed' && state !== 'closing') {
    state = 'closing';
    sendStateUpdate();

    // simulate door closed after 5 seconds (would be listening to hardware)
    setTimeout(function() {
      state = 'closed';
      sendStateUpdate();
    }, 5000);
  }
}

/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit(options, err) {
  if(err) {
    console.log(err.stack);
  }

  if(options.cleanup) {
    client.publish('garage/connected', 'false');
  }

  if(options.exit) {
    process.exit();
  }
}

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, { cleanup : true }));
process.on('SIGINT', handleAppExit.bind(null, { exit : true }));
process.on('uncaughtException', handleAppExit.bind(null, { exit : true }));
