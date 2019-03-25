/**
 * @file The most basic version of a spec file
 * @author Mattamorphic
 */

const logger = require('../bin/app');

module.exports = {
  // Create an endpoint called /webhook
  webhook: {
    // Send the data as a json payload
    content_type: 'json',
    // Callback to trigger, when the endpoint recieves a request
    callback: (res, req) => {
      logger.debug('Payload Recieved at /webhook');
      res.send(200).send('OK');
    },
    // The verb this endpoint responds too (usually POST!)
    verb: 'post',
    // The events to subscribe to - wildcard
    events: ['*'],
  },
}
