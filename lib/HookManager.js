/**
 * @file HookManager to manage our hooks!
 * @author Mattamorphic
 */
'use strict';

const logger = require('../bin/app');
/**
 * HookManager
 * Hook manager uses the GitHub API wrapper to manage the ngrok hooks
 * Instantiate with a valid ./lib/GitHub object
 */
class HookManager {
  /**
   * Add the GitHub API wrapper as an instance variable, and a setup flag
   *
   * @param {object} github The instantiated GitHub object
   */
  constructor(github) {
    this.github = github;
    this.hooks = [];
    this.is_setup = false;
  }

  /**
   * Setup the hook manager, loading in the current hooks
   */
  async setup() {
    this.hooks = await this.github.genHooks();
    this.is_setup = true;
  }

  /**
   * Check if a hook exists, and remove it
   *
   * @param {array} endpoints The endpoints to remove
   */
  async genCheckAndDeleteNgrokHooks(endpoints) {
    if (!this.is_setup) {
      logger.error('HookManager setup needs running');
      throw new Error('Run await HookManager.setup()');
    }
    const hookUrlToId = Object.assign(
        ...this.hooks.map((hook) => ({[hook.config.url]: hook.id})),
    );
    endpoints.forEach(async (endpoint, i) => {
      Object.keys(hookUrlToId).forEach(async (hookEndpoint) => {
        logger.debug(
            `${i} Comparing ${hookEndpoint} with ngrok.io/${endpoint}`,
        );
        if (hookEndpoint.includes(`ngrok.io/${endpoint}`)) {
          logger.debug(`${i} Removing ${hookEndpoint}`);
          await this.github.genDeleteHook(hookUrlToId[hookEndpoint]);
          logger.debug(`${i} Removed ${hookEndpoint}`);
        }
      });
    });
  }

  /**
   * Create hooks from the given spec
   *
   * @param {string} url  The base url for the hook
   * @param {object} spec The spec taken from the imported spec file
   *                      See `./example/spec.js` for details
   */
  async genCreateWebhooks(url, spec) {
    Object.keys(spec).forEach(async (endpoint, i) => {
      const config = {
        url: `${url}/${endpoint}`,
        content_type: spec[endpoint].content_type || 'json',
      };
      if (spec[endpoint].secret) {
        config.secret = spec[endpoint].secret;
      }
      if (spec[endpoint].url_params) {
        config.url += `/${Object.values(spec[endpoint].url_params).join('/')}`;
      }
      if (spec[endpoint].events) {
        config.events = spec[endpoint].events;
      }
      logger.debug(`${i} Creating ${config.url}`);
      await this.github.genCreateHook(config);
      logger.debug(`${i} Created ${config.url}`);
    });
  }
}

module.exports = HookManager;
