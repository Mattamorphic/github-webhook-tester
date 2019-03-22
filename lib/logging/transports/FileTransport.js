/**
 * @file File transport for logger
 * @author Mattamorphic
 */
'use strict';

const fs = require('fs');
const path = require('path');

const Transport = require('./Transport');

/**
 * FileTransport
 * A file transport for logs, this outputs to a file
 */
class FileTransport extends Transport {
  /**
   * A transport can be configured with multiple levels, or if omitted
   * just an info logging level
   *
   * @param {object} options The options for the transport layer
   */
  constructor(options) {
    super(options);
    if (!options.path) {
      throw new Error('.path must be provided');
    }
    try {
      fs.statSync(
          path.dirname(options.path),
      );
    } catch (err) {
      throw new Error('Can\'t access log file directory');
    }
    this.stream = fs.createWriteStream(options.path, {flags: 'a'});
  }
  /**
   * Write a string to the output stream
   * @param {string} string The string to write
   */
  write(string) {
    this.stream.write(`${string}\n`);
  }
}

module.exports = FileTransport;
