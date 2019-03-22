/**
 * @file Parent Transport for Logger
 * @author Mattamorphic
 */
'use strict';

const LoggingLevels = require('../LoggingLevels.js');

/**
 * Transport
 * All other tranports inherit from this
 */
class Transport {
  /**
   * A transport can be configured with multiple levels, or if omitted
   * just an info logging level
   *
   * @param {object} options The options for the transport layer
   */
  constructor(options) {
    const selectedLevelNumber = LoggingLevels.levelsNumbers[
        options.level || LoggingLevels.levels.all
    ];
    this.levels = Object.keys(LoggingLevels.levelsNumbers)
        .filter(
            (level) =>
              LoggingLevels.levelsNumbers[level] <= selectedLevelNumber,
        );
  }

  /**
   * Log method all transports must implement a write method
   *
   * @param {string}   date  The datetime of the log
   * @param {string}   level The level of the log
   * @param {array}    args  An array of strings to log
   * @param {function} cb    The callback for writing
   */
  log(date, level, args, cb) {
    if (!this.levels.includes(level)) {
      return;
    }
    args.forEach((string) => {
      this.write(`[${date}][${level.toUpperCase()}] ${string}`);
    });
  }
}

module.exports = Transport;
