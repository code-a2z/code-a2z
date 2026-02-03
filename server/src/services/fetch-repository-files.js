/**
 * Fetch Repository Files - Get file structure from a GitHub repository
 */

import { gh } from './utils/index.js';

/**
 * Fetches the file contents structure of a GitHub repository
 * @param {string} owner - Repository owner (GitHub username)
 * @param {string} repo - Repository name
 * @param {string} path - File path to fetch (optional, default: root)
 * @returns {Promise<Array<Object>>} Array of file objects with name and path
 * @throws {Error} If API call fails
 */
export async function fetchRepositoryFiles(owner, repo, path = '') {
  try {
    const url = path
      ? `/repos/${owner}/${repo}/contents/${path}`
      : `/repos/${owner}/${repo}/contents`;

    const data = await gh(url);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error(`Failed to fetch files from ${owner}/${repo}: ${error.message}`);
  }
}
