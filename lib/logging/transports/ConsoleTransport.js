/**
 * @file Console transport for logger
 * @author Mattamorphic
 */
'use strict';

const Transport = require('./Transport');
/**
 * ConsoleTransport
 * A console transport for logs, this outputs to the console
 */
class ConsoleTransport extends Transport {
  /**
   * Write a string to the console
   * @param {string} string The string to write
   */
  write(string) {
    console.log(string);
  }
}

module.exports = ConsoleTransport;
