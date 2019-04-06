/**
 * @file Octokit wrapper class, to simplify our operations
 * @author Mattamorphic
 */
'use strict';

const Octokit = require('@octokit/rest');
const logger = require('../bin/app');

/**
 * Octokit wrapper class
 */
class GitHub {
  /**
   * Configure the octokit class, and add this as an instance variable
   *
   * @param {string} token The oauth access token to use
   * @param {string} owner The target owner
   * @param {string} repo The target repo
   */
  constructor(token, owner, repo) {
    this.owner = owner;
    this.repo = repo;
    this.octokit = new Octokit({
      auth: `token ${token}`,
      userAgent: 'octokit/rest.js v1.2.3',
      previews: [],
      baseURI: 'https://api.github.com',
    });
  }

  /**
   * gen the existing hooks on the repo
   *
   */
  async genHooks() {
    try {
      const hooks = await this.octokit.repos.listHooks({
        owner: this.owner,
        repo: this.repo,
      });
      return hooks.data;
    } catch (err) {
      logger.error(`Error fetching existing hooks from ${owner}/${repo}`);
      throw new Error(err);
    }
  }

  /**
   * Delete a hook by hook_id
   *
   * @param {number} hookId The id of the hook
   */
  async genDeleteHook(hookId) {
    try {
      await this.octokit.repos.deleteHook({
        owner: this.owner,
        repo: this.repo,
        hook_id: hookId,
      });
    } catch (err) {
      logger.error(`Error deleting hook ${hookId} from ${owner}/${repo}`);
      throw new Error(err);
    }
  }

  /**
   * Create a hook
   *
   * @param {object} config Config for the hook
   */
  async genCreateHook(config) {
    const events = config.events;
    delete config.events;
    try {
      await this.octokit.repos.createHook({
        owner: this.owner,
        repo: this.repo,
        config,
        events,
      });
    } catch (err) {
      logger.error(
          `Error creating hook ${JSON.stringify(config)} in ${owner}/${repo}`,
      );
      throw new Error(err);
    }
  }
}

module.exports = GitHub;
