/**
 * Fetch Repository Languages - Get programming languages used in a repository
 */

import { gh } from './utils/index.js';

/**
 * Fetches the programming languages used in a GitHub repository
 * @param {Object} repo - Repository object with owner and name properties
 * @param {string} repo.owner.login - Repository owner username
 * @param {string} repo.name - Repository name
 * @returns {Promise<Object>} Object with language names as keys and bytes as values
 * @throws {Error} If API call fails
 */
export async function fetchRepositoryLanguages(repo) {
  try {
    if (!repo || !repo.owner || !repo.owner.login || !repo.name) {
      throw new Error('Invalid repository object: missing owner or name');
    }

    const data = await gh(
      `/repos/${repo.owner.login}/${repo.name}/languages`
    );
    return data || {};
  } catch (error) {
    throw new Error(
      `Failed to fetch languages from ${repo.owner?.login}/${repo.name}: ${error.message}`
    );
  }
}
