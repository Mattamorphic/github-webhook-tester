/**
 * @file console args handling this will also parse the options before we start
 * our app
 * @author Mattamorphic
 */
'use strict';

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const LoggingLevels = require('../lib/logging/LoggingLevels');
const ConsoleTransport = require('../lib/logging/transports/ConsoleTransport');
const FileTransport = require('../lib/logging/transports/FileTransport');
const path = require('path');

// Sections / Options for CLI Args
const args = require('./args');

// Options for our command line args
const options = commandLineArgs(args.options);

/**
 * Print the help
 */
if (options.help) {
  console.log(commandLineUsage(args.sections));
  process.exit(0);
}

/**
 * Global console suppression
 */
if (options.suppressConsole) {
  options.suppressConsoleLogs = true;
  options.suppressConsoleHooks = true;
}

/**
 * Repo vaidation
 */
const validRepo = (
  options.repo
  && options.repo.length === 2
  && options.repo[0] != null
  && options.repo[0].length > 1
  && options.repo[1] != null
  && options.repo[1].length > 1
);
if (!validRepo) {
  console.log('--repo must be provided as owner/repo');
  process.exit(0);
}


if (!options.token) {
  console.log('--token github oauth must be provided with repo scope');
  process.exit(0);
  // Add ability to prompt
  // const input = require('./input');
  // options.token = input.muted('token');
}

/**
 * Logger setup
 *
 * @param {array} logdef
 * @param {int}   level
 *
 * @return {array}
 */
function createLoggers(logdef = [], level = LoggingLevels.levels.info) {
  return logdef.filter((def) => def !== null).map(
      (def) => (options.path)
      ? new FileTransport({level, path: path.resolve(def.path)})
      : new ConsoleTransport({level}),
  );
}

module.exports = {
  loggers: createLoggers(
      [
        !options.supressConsoleLogs ? {} : null,
        options.logfile ? {path: options.logfile} : null,
      ],
      options.logLevel,
  ),
  level: options.logLevel,
  owner: options.repo[0],
  payloadLoggers: createLoggers(
      [
        !options.suppressConsoleHooks ? {} : null,
        options.hookfile ? {path: options.hookfile} : null,
      ],
  ),
  repo: options.repo[1],
  spec: options.spec,
  token: options.token,
  port: options.port,
  clear: options.clear,
};
