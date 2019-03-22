# GitHub Webhook Tester

The GitHub Webhook Tester is a tool that generates an API exposed over an ngrok tunnel, configures a repositories webhooks to use this API, and provides multiway logging for events.

## Overview
When developing or testing a solution that will use Webhooks we often find ourselves creating or modifying an API, creating an ngrok tunnel, removing any redundant hooks from the repository, adding new hooks with the new ngrok.io url, writing the raw logs to a file, or to the console and trying to iterate on the solution. Unless we keep the ngrok tunnel running, when we restart this - we end up with a new URL. This means that all of the hooks we have now have incorrect URLs, making them non-reusable. We also might have to create a lot of boiler plate to simply test one aspect, which takes time and leads to a lot of repeated copypasta.

How does this tool address this?

1. First get the command line args and parse these - generating any required logger instances
2. Next build and start a REST API server from the blueprint provided in the `--spec` argument, see `./example/` for example blueprints
3. Create an ngrok.io tunnel, and generate a url
4. Connect to the GitHub repository
5. Delete any existing hooks that use ngrok.io and exist in the blueprint we provided
6. Create a brand new set of hooks using the new ngrok.io tunnel and the blueprint in the spec file
7. Provide multiway logging and execute the callbacks designated in the spec file

## Usage

### Basic startup
`github-webhook-tester`
- This uses the `./example/spec.js` blueprint
- Logging is configured for ALL events
- Logging is defaulted to the console
- All payloads are logged to the console

### Specify different spec file
`github-webhook-tester --spec=path/to/jsspec`
- Same as above, but with a different blueprint
- This will use `path/to/jsspec`

### No console logging
`github-webhook-tester --noConsoleLogging`
- Don't print system logs, just webhook payloads
- This will use `./example/spec.js`

### No payload logging, and info level logging  
`github-webhook-tester --noConsoleOutput --logLevel=4`
- Don't print payload logs, just system logs
- Listen for logs at info level
- This will use `./example/spec.js`

### Console logging, File payload logging
`mkdir logs && github-webhook-tester --noConsoleOutput --outputFile=./logs/payloads.log`
- create a logs directory
- Print system logs to the console
- Print the payload logs to the output file designated in `--outputFile`
- This will use `./example/spec.js`

See a full breakdown of the options below

## Options

- `--logLevel` Specify the level of logging for the system logs (defaults to 5 for ALL logs)

- `--spec` Specify the blueprint file to use for the API (`--spec=./path/bp.js`)

- `--fileLogging` Specify the file to write the system logs to (`--fileLogging=./logs/log.log`)

- `--noConsoleLogging` Switch off console logging

- `--outputFile` Specify the file to write the webhook content to (`--outputFile=./logs/payload.log`)

- `--noConsoleOutput` Switch off console output of the payloads

## Blueprint, a how to...

The spec file is relatively straightforward, the js module you create must return specific keys:
```
module.exports = {
  hook_endpoint: {
    content_type: json,
    callback: (req, res) => {},
    verb: 'post',
    events: ['*'],
  }
```
The outer keys of the object we provide to module.exports are our endpoints, in this case `/hook_endpoint`.
For each of these endpoints we provide:
- `content_type` for the webhook, this will either be `json` or `form`, `json` makes the most sense here.
- `callback` is the function that will be called when a payload is received, the callback function is an express-js callback: https://expressjs.com/en/api.html#app.post.method req is the request, res is your response (send a 200!)
- `verb` is the http method, in all cases this will be `post` - but for flexibility why not :smile:
- `events` is an array of events that you want this webhook to listen for, `*` is a wildcard


## Installation
From npm (soon!)
1. Installing the base app `npm install github-webhook-tester`

From github
1. `git clone git@github.com:Mattamorphic/github-webhook-tester.git`

2. `npm link` to locally link the bin file to your bash profile

3. Setup your .env file `mv .env.template .env` then populate what it asks for :wink:

4. Setup a free ngrok.io account [ngrok](https://ngrok.com/) and setup the token (see the account page)


## TODO List

1. Finish the command line options
2. Add tests to maintain stability and integrity
3. Add to npm
4. Add more spec examples
5. Add further logging transport layers 

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
