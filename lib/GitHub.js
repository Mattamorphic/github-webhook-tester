/**
 * @file Octokit wrapper class, to simplify our operations
 * @author Mattamorphic
 */
'use strict';

const Octokit = require('@octokit/rest');
const baseOwner = process.env.OWNER;
const baseRepo = process.env.REPO;
const logger = require('../bin/app');
/**
 * Octokit wrapper class
 */
class GitHub {
  /**
   * Configure the octokit class, and add this as an instance variable
   *
   * @param {string} token The oauth access token to use
   */
  constructor(token) {
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
   * @param {string} owner The repo owner (default: env)
   * @param {string} repo  The repo  (default: env)
   */
  async genHooks(owner=baseOwner, repo=baseRepo) {
    try {
      const hooks = await this.octokit.repos.listHooks({
        owner,
        repo,
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
   * @param {string} owner   The repo owner (default: env)
   * @param {string} repo    The repo  (default: env)
   */
  async genDeleteHook(hookId, owner=baseOwner, repo=baseRepo) {
    try {
      await this.octokit.repos.deleteHook({
        owner,
        repo,
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
   * @param {string} owner  The repo owner (default: env)
   * @param {string} repo   The repo  (default: env)
   */
  async genCreateHook(config, owner=baseOwner, repo=baseRepo) {
    const events = config.events;
    delete config.events;
    try {
      await this.octokit.repos.createHook({
        owner,
        repo,
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
