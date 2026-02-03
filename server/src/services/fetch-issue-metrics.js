/**
 * Fetch Issue Metrics - Analyze issue resolution times and statistics
 */

import { gh } from './utils/index.js';

/**
 * Fetches and analyzes issue metrics for a repository
 * Calculates resolution time in hours for each closed issue
 * @param {string} owner - Repository owner (GitHub username)
 * @param {string} repo - Repository name
 * @returns {Promise<Array<Object>>} Array of issue metrics with resolution times
 * @throws {Error} If API call fails
 */
export async function fetchIssueMetrics(owner, repo) {
  try {
    const issues = await gh(`/repos/${owner}/${repo}/issues?state=all`);

    if (!Array.isArray(issues)) {
      throw new Error('Invalid response format: expected array of issues');
    }

    return issues
      .filter((issue) => issue.closed_at)
      .map((issue) => ({
        issueNumber: issue.number,
        resolutionTimeHours:
          (new Date(issue.closed_at) - new Date(issue.created_at)) / 36e5
      }));
  } catch (error) {
    throw new Error(
      `Failed to fetch issue metrics for ${owner}/${repo}: ${error.message}`
    );
  }
}
