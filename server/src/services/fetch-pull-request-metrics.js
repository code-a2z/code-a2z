/**
 * Fetch Pull Request Metrics - Analyze PR merge times and statistics
 */

import { gh } from './utils/index.js';

/**
 * Fetches and analyzes pull request metrics for a repository
 * Calculates merge time in hours for each merged PR
 * @param {string} owner - Repository owner (GitHub username)
 * @param {string} repo - Repository name
 * @returns {Promise<Array<Object>>} Array of PR metrics with merge times
 * @throws {Error} If API call fails
 */
export async function fetchPullRequestMetrics(owner, repo) {
  try {
    const prs = await gh(`/repos/${owner}/${repo}/pulls?state=all`);

    if (!Array.isArray(prs)) {
      throw new Error('Invalid response format: expected array of PRs');
    }

    return prs
      .filter((pr) => pr.merged_at)
      .map((pr) => ({
        prNumber: pr.number,
        mergeTimeHours:
          (new Date(pr.merged_at) - new Date(pr.created_at)) / 36e5
      }));
  } catch (error) {
    throw new Error(
      `Failed to fetch PR metrics for ${owner}/${repo}: ${error.message}`
    );
  }
}
