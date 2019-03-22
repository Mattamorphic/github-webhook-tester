/**
 * @file An example spec file that can be used
 * @author Mattamorphic
 */
'use strict';

require('dotenv').config();
const clc = require('cli-color');
const logger = require('../bin/app');
/**
 * Callback for the validation endpoint, this is the route. See ExpressJS
 *
 * @param {object} req The request
 * @param {object} res The response
 */
function validation(req, res) {
  /**
   * Check the signature is valid
   * We use the payload of the request, the signature from the X-Hub-Signature
   * header and the webhook secret we define on creating the webhook
   *
   * @param {string} payload   (JSON.stringify the request payload json)
   * @param {string} signature The signature taken from the header
   * @param {string} key       The webhook secret token
   *
   * @return {boolean}
   */
  function isValidSignature(payload, signature, key) {
    const crypto = require('crypto');
    const genSignature = 'sha1=' + crypto
        .createHmac('sha1', key)
        .update(payload)
        .digest('hex');
    logger.debug(`${genSignature} == ${signature}`);
    return signature == genSignature;
  }

  const signature = req.get('X-Hub-Signature');
  logger.debug(
      `${clc.white('VALIDATION')}: Payload received, `
      + `with signature ${signature}`
  );
  // Check to see if the signature is valid
  if (
    isValidSignature(
        JSON.stringify(req.body),
        signature,
        process.env.WEBHOOK_TOKEN,
    )
  ) {
    logger.debug(clc.white('VALIDATION') + ': Valid signature! Woop!');
    // On success return a 200
    res.status(200).send('OK');
  } else {
    // On error return a 403 forbidden
    res.status(403).send(
        clc.white('VALIDATION') +
        ': Invalid signature, you didn\'t say the magic word',
    );
  }
  logger.debug(clc.white('VALIDATION') + ': DONE!');
}

/**
 * Callback for the slow endpoint, this is the route. See ExpressJS
 *
 * @param {object} req The request
 * @param {object} res The response
 */
async function slow(req, res) {
  /**
   * Sleep function
   *
   * @param {number} ms How long to sleep for
   *
   * @return {Promise}
   */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Pause for a duration of time
   *
   * @param {number} duration (miliseconds)
   */
  async function pause(duration = 500) {
    logger.debug(clc.yellow('SLOW') + `: Sleeping for ${duration}ms...`);
    await sleep(duration);
    logger.debug(clc.yellow('SLOW') + ': Waking up...');
  }

  logger.debug(clc.yellow('SLOW') + ': Payload received, sleeping...');
  await pause(req.params.duration);
  logger.debug(clc.yellow('SLOW') + ': Sending 200 OK back');
  res.status(200).send('OK');
  logger.debug(clc.yellow('SLOW') + ': DONE!');
}

/**
 * Callback for the error endpoint, this is the route. See ExpressJS
 *
 * @param {object} req The request
 * @param {object} res The response
 */
function error(req, res) {
  logger.debug(clc.red('ERROR') + ': Payload received, erroring...');
  res.status(500).send('ERROR: *explosion* This seems fine....');
  logger.debug(clc.red('ERROR') + ': DONE!');
};

/**
 * Callback for the success endpoint, this is the route. See ExpressJS
 *
 * @param {object} req The request
 * @param {object} res The response
 */
function success(req, res) {
  logger.debug(clc.green('SUCCESS') + ': Payload recieved...');
  res.status(200).send('SUCCESS: OK');
  logger.debug(clc.green('SUCCESS') + ': DONE!');
};

module.exports = {
  error: {
    content_type: 'json',
    callback: error,
    verb: 'post',
    events: ['*'],
  },
  slow: {
    url_params: {
      duration: 10000,
    },
    callback: slow,
    content_type: 'json',
    verb: 'post',
    events: ['*'],
  },
  success: {
    callback: success,
    content_type: 'json',
    verb: 'post',
    events: ['*'],
  },
  validation: {
    callback: validation,
    content_type: 'json',
    secret: process.env.WEBHOOK_TOKEN,
    verb: 'post',
    events: ['*'],
  },
};
