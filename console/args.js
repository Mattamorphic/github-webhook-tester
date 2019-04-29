const LoggingLevels = require('../lib/logging/LoggingLevels');
const path = require('path');

const options = [
  {
    name: 'clear',
    description: 'NOT IMPLEMENTED: Clear any of the ngrok endpoints '
      + '- without rebuilding them',
    type: Boolean,
  },
  {
    name: 'logLevel',
    description: 'Desired logging level - '
      + Object.keys(
          LoggingLevels.levelsNumbers,
      ).map((level) => `${LoggingLevels.levelsNumbers[level]}: ${level}`)
          .join(', ')
      + ' Default 5',
    type: (logLevel) => Object.keys(
        LoggingLevels.levelsNumbers,
    )
        .find((key) => LoggingLevels.levelsNumbers[key] === logLevel),
    defaultValue: LoggingLevels.levels.all,
  },
  {
    name: 'spec',
    description: 'The spec file for your api / webhooks - see the readme'
      + ' for more details. Default: ./example/basic.js',
    type: (spec) => {
      try {
        const fs = require('fs');
        fs.accessSync(spec, fs.constants.F_OK | fs.constants.R_OK);
        return path.resolve(spec);
      } catch (err) {
        throw new Error(
            `No access to ${spec} check it exists, and is readable`,
        );
      }
    },
    defaultValue: path.resolve(
        require.main.filename.replace('/bin/app.js', '/example/basic.js'),
    ),
  },
  {
    name: 'logfile',
    description: 'File for logging denoted by the log level'
      + ' Eg --logfile=./logs/logs.log',
    type: String, // TODO check file exists or is writable dir
  },
  {
    name: 'suppressConsoleLogs',
    description: 'Turn off console logging',
    type: Boolean,
  },
  {
    name: 'hookfile',
    description: 'File for logging the webhook payloads.'
      + ' Eg --hookfile=./logs/payloads.log',
    type: String, // TODO check file exists or is writable dir
  },
  {
    name: 'suppressConsoleHooks',
    description: 'Turn off console logging for webhook payloads',
    type: Boolean,
  },
  {
    name: 'supressConsole',
    description: 'Turn off console output for logging and payloads',
    type: Boolean,
  },
  {
    name: 'repo',
    description: 'The target repository :owner/:repo',
    type: (repo) => repo.split('/'),
    defaultValue: [],
  },
  {
    name: 'token',
    description: 'The OAuth Token you are using, if omitted we\'ll prompt',
    type: String, // TODO token verification
  },
  {
    name: 'port',
    description: 'The port to expose ngrok over, defaults to 5000',
    type: Number,
    defaultValue: 5000,
  },
  {
    name: 'help',
    description: 'Print this usage guide.',
    type: Boolean,
  },
];


const sections = [
  {
    header: 'GitHub Webhook Tester',
    content: 'Create an API with Ngrok & update/log webhooks on a GitHub Repo',
  },
  {
    header: 'Options',
    optionList: options.map(
        (option) => ({name: option.name, description: option.description}),
    ),
  },
];

module.exports = {
  sections,
  options: options.map((option) => {
    const cliOption = {
      name: option.name,
      type: option.type,
    };
    if (option.defaultValue) {
      cliOption.defaultValue = option.defaultValue;
    }
    if (option.alias) {
      cliOption.alias = option.alias;
    }
    return cliOption;
  }),
};
