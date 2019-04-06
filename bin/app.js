#! /usr/bin/env node
/**
 * @file Runner for the github-webhook-tester
 * @author Mattamorphic
 */
'use strict';

require('dotenv').config();

// Express JS imports
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ngrok = require('ngrok');

// Console arguments and preconfiguration (i.e. logger config setups)
const options = require('../console');

// Build loggers and expose these to the rest of the app
const Logger = require('../lib/logging/Logger.js');
const logger = new Logger(options.loggers);
const payloadLogger = new Logger(options.payloadLoggers);
logger.debug(`Loggers enabled for: ${options.level} log level`);
module.exports = logger;


// Application/json parser
app.use(bodyParser.json());
// Application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({extended: true}));

// Filter out any pings during creation via middleware
app.use((req, res, next) => {
  payloadLogger.info(
      JSON.stringify({
        payload: req.body,
        headers: req.headers,
      },
      null,
      2
      ),
  );
  if (req.body && req.body.zen) {
    const hookID = req.body.hook_id || null;
    const url = req.body.hook && req.body.hook.config
        ? req.body.hook.config.url
        : null;
    logger.info(`${hookID}:${url} creation ping`);
    res.status(200).send('OK');
    return;
  }
  next();
});

// Fetch a spec, use './example/spec.js' as default
const spec = require(options.spec);

// Validate the spec

// Create the api, and start the server
const requiredSpecKeys = [
  'content_type',
  'callback',
  'verb',
  'events',
];
Object.keys(spec).forEach((route) => {
  if (
    requiredSpecKeys.filter(
        (key) => Object.keys(spec[route]).includes(key)
    ).length !== requiredSpecKeys.length) {
    logger.error(
        `Route ${route} in spec is missing one of the required keys `
        + requiredSpecKeys.join(', '));
    throw new Error(`Missing required spec key in ${route}`);
  }
  let endpoint = `/${route}`;
  if (spec[route].url_params) {
    endpoint += '/:' + Object.keys(spec[route].url_params).join('/:');
  }
  logger.info(`Building API: ${spec[route].verb.toUpperCase()} ${endpoint}`);
  app[spec[route].verb](endpoint, spec[route].callback);
  app['get'](endpoint, (req, res) => res.status(200).send('OK'));
});

const server = app.listen(options.port, () => {
  logger.info('API Server listening on ', server.address().port);
});

/**
 * Create an Ngrok URL
 *
 * @param {number} port The port for ngrok to tunnel on
 */
async function genNgrokURL(port) {
  try {
    return await ngrok.connect(port);
  } catch (err) {
    logger.error(`Ngrok Error: ${err}`);
    throw new Error(err);
  }
}

/**
 * Main Setup Bootstrap
 * This will setup the ngrok tunnel, check for and delete existing hooks that
 * exist in our spec, and create these with the new ngrok tunnel
 */
(async function() {
  const url = await genNgrokURL(options.port);
  logger.info(`Ngrok tunnel established on: ${url}:${options.port}`);

  // Create our hook manager
  const GitHub = require('../lib/GitHub');
  logger.debug(
      `Configuring GitHub Hooks with ${options.owner}/${options.repo}`,
  );
  const github = new GitHub(
      options.token,
      options.owner,
      options.repo,
  );
  const HookManager = require('../lib/HookManager');
  const hookManager = new HookManager(github);
  await hookManager.setup();

  const endpoints = Object.keys(spec);

  // If we have hooks, then look for conflicting/dead hooks and remove these
  if (hookManager.hooks.length > 0) {
    logger.debug(`Deleting ngrok hooks: ngrok.io/${endpoints.join('|')}`);
    if (!options.clear) {
      await hookManager.genCheckAndDeleteNgrokHooks(endpoints);
    } else {
      await hookManager.genDeleteAllNgrokHooks();
    }
  }
  await hookManager.genCreateWebhooks(url, spec);
})();

/**
 * Graceful shutdown process should this be run as a deamon process and killed
 */
process.on('SIGTERM', () => {
  logger.debug('SIGTERM signal received.');
  logger.info('Closing http server.');
  server.close(() => {
    logger.info('Http server closed.');
    process.exit(0);
  });
});
