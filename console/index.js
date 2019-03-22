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
// Sections for our usage guide
const sections = [
  {
    header: 'GitHub Webhook Tester',
    content: 'Create an API with Ngrok & update/log webhooks on a GitHub Repo',
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'clear',
        description: 'NOT IMPLEMENTED: Clear any of the ngrok endpoints '
          + '- without rebuilding them',
      },
      {
        name: 'logLevel',
        description: 'Desired logging level - '
          + Object.keys(
              LoggingLevels.levelsNumbers,
          ).map((level) => `${LoggingLevels.levelsNumbers[level]}: ${level}`)
              .join(', ')
          + ' Default 5',
      },
      {
        name: 'spec',
        description: 'The spec file for your api / webhooks - see the readme'
          + ' for more details. Default: ./example/spec.js',
      },
      {
        name: 'fileLogging',
        description: 'File for logging denoted by the log level'
          + ' Eg --fileLogging=./logs/logs.log',
      },
      {
        name: 'noConsoleLogging',
        description: 'Turn off console logging',
      },
      {
        name: 'outputFile',
        description: 'File for logging the webhook payloads.'
          + ' Eg --outputFile=./logs/payloads.log',
      },
      {
        name: 'noConsoleOutput',
        description: 'Turn off console logging for webhook payloads',
      },
      {
        name: 'help',
        description: 'Print this usage guide.',
      },
    ],
  },
];

// Options for our command line args
const options = commandLineArgs([
  {name: 'help', alias: 'h', type: Boolean},
  {name: 'logLevel', alias: 'l', type: Number, defaultValue: 5},
  {name: 'spec', type: String, defaultValue: './example/spec.js'},
  {name: 'fileLogging', type: String},
  {name: 'noConsoleLogging', type: Boolean, defaultValue: false},
  {name: 'outputFile', type: String},
  {name: 'noConsoleOutput', type: Boolean, defaultValue: false},
  {name: 'clear', alias: 'd', type: Boolean},
]);

// If we have a help option - print and quit
if (options.help || options.h) {
  console.log(commandLineUsage(sections));
  process.exit(0);
}

const level = Object.keys(
    LoggingLevels.levelsNumbers,
)
    .find((key) => LoggingLevels.levelsNumbers[key] === options.logLevel);

// Configure API Loggers
const loggers = [];
if (!options.noConsoleLogging) {
  loggers.push(
      new ConsoleTransport({
        level,
      }),
  );
}

if (options.fileLogging) {
  loggers.push(
      new FileTransport({
        level,
        path: path.resolve(options.fileLogging),
      }),
  );
}

if (loggers.length === 0) {
  console.log(
      'Warning: Suggest using either --consoleLogging '
      + 'and/or --fileLogging to monitor setup process',
  );
}

// Configure Webhook Payload Loggers
const payloadLoggers = [];
if (options.outputFile) {
  payloadLoggers.push(
      new FileTransport({
        level: LoggingLevels.levels.info,
        path: path.resolve(options.outputFile),
      }),
  );
}

if (!options.noConsoleOutput) {
  payloadLoggers.push(
      new ConsoleTransport({
        level: LoggingLevels.levels.info,
      }),
  );
}

if (payloadLoggers.length === 0) {
  console.log(
      'Warning: Suggest using either --outputConsole '
      + 'and/or --outputFile to monitor incoming payloads',
  );
}

// Check the spec file exists and is readable
try {
  const fs = require('fs');
  fs.accessSync(options.spec, fs.constants.F_OK | fs.constants.R_OK);
  options.spec = path.resolve(options.spec);
} catch (err) {
  throw new Error(
      `No access to ${options.spec} check it exists, and is readable`,
  );
}

module.exports = {
  args: options,
  loggers,
  level,
  payloadLoggers,
  specFile: options.spec,
};
