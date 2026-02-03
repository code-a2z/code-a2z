/**
 * Fetch GitHub Repositories - Get user's repositories from GitHub API
 */

import { gh } from './utils/index.js';

/**
 * Fetches all repositories for a given GitHub user
 * @param {string} username - GitHub username
 * @param {number} perPage - Number of repos to fetch per page (default: 1)
 * @returns {Promise<Array<Object>>} Array of repository objects
 * @throws {Error} If API call fails or returns invalid data
 */
export async function fetchGitHubRepos(username, perPage = 1) {
  try {
    const data = await gh(`/users/${username}/repos?per_page=${perPage}`);

    if (!Array.isArray(data)) {
      throw new Error('Failed to fetch repositories: Invalid response format');
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to fetch repositories for user ${username}: ${error.message}`);
  }
}
