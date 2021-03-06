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
`github-webhook-tester --token XXX --repo :owner/:repo`
- This uses the `./example/basic.js` blueprint
- This uses port 5000 for ngrok
- The token option is an OAuth token with repo scope
- The repo flag denotes the owner/repo to configure this on
- Logging is configured for ALL events
- Logging is defaulted to the console
- All payloads are logged to the console

### Specify different spec file
`github-webhook-tester --token XXX --repo :owner/:repo --spec path/to/jsspec`
- Same as above, but with a different blueprint
- This will use `path/to/jsspec`

### No console logging
`github-webhook-tester --token XXX --repo :owner/:repo --noConsoleLogging`
- This uses the `./example/basic.js` blueprint
- Don't print system logs, just webhook payloads

### No payload logging, and info level logging  
`github-webhook-tester --token XXX --repo :owner/:repo --noConsoleOutput --logLevel 4`
- This uses the `./example/basic.js` blueprint
- Don't print payload logs, just system logs
- Listen for logs at info level

### Console logging, File payload logging
`mkdir logs && github-webhook-tester --token XXX --repo :owner/:repo --noConsoleOutput --hookfile=./logs/payloads.log`
- create a logs directory
- Print system logs to the console
- Print the payload logs to the output file designated in `--outputFile`
- This will use `./example/basic.js`

See a full breakdown of the options below

## Options

- `--logLevel` Specify the level of logging for the system logs (defaults to 5 for ALL logs)

- `--spec` Specify the blueprint file to use for the API (`--spec=./path/bp.js`)

- `--repo` Specify the target repository to manage the hooks on

- `--token` Specify the OAuth token with repo scope to use

- `--port` Specify the port to expose to ngrok, defaults to 5000

- `--logfile` Specify the file to write the system logs to (`--logfile ./logs/log.log`)

- `--suppressConsoleLogs` Switch off console logging

- `--hookfile` Specify the file to write the webhook content to (`--hookfile ./logs/payload.log`)

- `--suppressConsoleHooks` Switch off console output of the payloads

- `--suppressConsole` Switch off all console output

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
`npm install -g github-webhook-tester`
Don't forget to setup a free ngrok.io account [ngrok](https://ngrok.com/) and setup the token (see the account page)


## TODO List

1. Finish the command line options
2. Add tests to maintain stability and integrity
3. Add more spec examples
4. Add further logging transport layers

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
