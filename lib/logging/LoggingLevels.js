'use strict';

const levels = {
  error: 'error',
  warning: 'warning',
  notice: 'notice',
  info: 'info',
  debug: 'debug',
  all: 'all',
};

const levelsNumbers = {
  [levels.error]: 0,
  [levels.warning]: 1,
  [levels.notice]: 2,
  [levels.info]: 3,
  [levels.debug]: 4,
  [levels.all]: 5,
};

module.exports = {
  levels,
  levelsNumbers,
};
