/**
 * @file A logger class
 * @author Mattamorphic
 */
'use strict';

const LoggingLevels = require('./LoggingLevels.js');

/**
 * Logger
 * Logger uses different transports to log output
 */
class Logger {
  /**
   * Upon instantiation configure the logging levels and transports
   *
   * @param {array} transports The transport layers to use
   */
  constructor(transports) {
    this.transports = {
      [LoggingLevels.levels.info]: [],
      [LoggingLevels.levels.debug]: [],
      [LoggingLevels.levels.notice]: [],
      [LoggingLevels.levels.warning]: [],
      [LoggingLevels.levels.error]: [],
    };
    transports.forEach((transport) =>
      transport.levels.forEach(
          (level) => this.transports[level]
            && this.transports[level].push(transport),
      )
    );
  }

  /**
   * Call the log method on the given transports with the given args
   *
   * @param {string} level LoggingLevels level that we are logging at
   * @param {array}  args  The args that we are logging, usually strings
   */
  log(level, args) {
    const date = this.getDate(new Date());
    this.transports[level].forEach(
        (transport) => transport.log(date, level, args),
    );
  }

  /**
   * Info logging method
   *
   * @param {array} args The args to log
   */
  info(...args) {
    this.log(
        LoggingLevels.levels.info,
        args,
    );
  }

  /**
   * Debug logging method
   *
   * @param {array} args The args to log
   */
  debug(...args) {
    this.log(
        LoggingLevels.levels.debug,
        args,
    );
  }

  /**
   * Notice logging method
   *
   * @param {array} args The args to log
   */
  notice(...args) {
    this.log(
        LoggingLevels.levels.notice,
        args,
    );
  }

  /**
   * Warning logging method
   *
   * @param {array} args The args to log
   */
  warning(...args) {
    this.log(
        LoggingLevels.levels.warning,
        args,
    );
  }

  /**
   * Error logging method
   *
   * @param {array} args The args to log
   */
  error(...args) {
    this.log(
        LoggingLevels.levels.error,
        args,
    );
  }

  /**
   * Get the date in a yyyy-mm-dd format
   *
   * @param {date} date A date object
   *
   * @return {string}
   */
  getDate(date) {
    return [
      date.getFullYear(),
      this.padNumberStringLessThanTen(date.getMonth()+1),
      this.padNumberStringLessThanTen(date.getDate()),
    ].join('-')
    + ' ' +
    [
      this.padNumberStringLessThanTen(date.getHours()),
      this.padNumberStringLessThanTen(date.getMinutes()),
      this.padNumberStringLessThanTen(date.getSeconds()),
    ].join(':');
  }

  /**
   * Pad values lower than 10 with a 0 for printing
   *
   * @param {number} val A number to pad
   *
   * @return {string}
   */
  padNumberStringLessThanTen(val) {
    return val < 10 ? '0' + val : val;
  }
}

module.exports = Logger;
