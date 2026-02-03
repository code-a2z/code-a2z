/**
 * Detect developer capabilities based on repository files and dependencies
 * Analyzes files, paths, and keywords to identify technical skills
 */

import { FEATURE_RULES } from './constants/feature-rules.js';

/**
 * Analyzes files and dependencies to detect developer capabilities
 * @param {Array<Object>} files - Repository files with name and path properties
 * @param {Array<string>} deps - Dependency list (optional)
 * @returns {Array<string>} List of detected capabilities
 */
export function detectCapabilities(files, deps = []) {
  const detected = new Set();

  for (const rule of FEATURE_RULES) {
    let matched = false;

    if (rule.signals.files) {
      matched ||= files.some((f) => rule.signals.files.includes(f.name));
    }

    if (rule.signals.paths) {
      matched ||= files.some((f) =>
        rule.signals.paths.some((p) => f.path?.startsWith(p))
      );
    }

    if (rule.signals.keywords) {
      matched ||= deps.some((d) => rule.signals.keywords.includes(d));
    }

    if (matched) detected.add(rule.capability);
  }

  return [...detected];
}
