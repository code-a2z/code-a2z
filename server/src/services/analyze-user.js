/**
 * Analyze User - Comprehensive GitHub user analysis
 * Gathers repositories, analyzes code patterns, and computes metrics
 */

import { fetchGitHubRepos } from './fetch-github-repos.js';
import { fetchRepositoryFiles } from './fetch-repository-files.js';
import { fetchRepositoryLanguages } from './fetch-repository-languages.js';
import { fetchPullRequestMetrics } from './fetch-pull-request-metrics.js';
import { fetchIssueMetrics } from './fetch-issue-metrics.js';
import { detectCapabilities } from './detect-capabilities.js';

/**
 * Analyzes a GitHub user's repositories and generates capability metrics
 * Fetches repo information, analyzes files, and computes PR/issue metrics
 * @param {string} username - GitHub username to analyze
 * @returns {Promise<Array<Object>>} Analysis results per repository
 * @throws {Error} If user not found or API fails
 */
export async function analyzeUser(username) {
  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username: must be a non-empty string');
  }

  try {
    const repos = await fetchGitHubRepos(username);
    const analysisResults = [];

    for (const repo of repos) {
      console.log('Analyzing repo:', repo.owner.login, repo.name);

      try {
        // Fetch repository files
        console.log('Fetching files...');
        const files = await fetchRepositoryFiles(
          repo.owner.login,
          repo.name
        );

        // Detect capabilities based on files
        const capabilities = detectCapabilities(files, []);

        // Fetch PR metrics
        console.log('Fetching PR metrics...');
        const prMetrics = await fetchPullRequestMetrics(
          repo.owner.login,
          repo.name
        );

        // Fetch issue metrics
        console.log('Fetching issue metrics...');
        const issueMetrics = await fetchIssueMetrics(
          repo.owner.login,
          repo.name
        );

        // Fetch languages
        console.log('Fetching languages...');
        const languages = await fetchRepositoryLanguages(repo);

        // Calculate averages
        const avgPRMergeTime =
          prMetrics.length
            ? prMetrics.reduce((a, b) => a + b.mergeTimeHours, 0) /
              prMetrics.length
            : null;

        const avgIssueResolutionTime =
          issueMetrics.length
            ? issueMetrics.reduce((a, b) => a + b.resolutionTimeHours, 0) /
              issueMetrics.length
            : null;

        analysisResults.push({
          repo: repo.name,
          languages: Object.keys(languages),
          capabilities,
          avgPRMergeTime,
          avgIssueResolutionTime
        });
      } catch (repoError) {
        console.error(`Error analyzing repo ${repo.name}:`, repoError.message);
        // Continue with next repo even if one fails
        continue;
      }
    }

    return analysisResults;
  } catch (error) {
    throw new Error(
      `Failed to analyze user ${username}: ${error.message}`
    );
  }
}
