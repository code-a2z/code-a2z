import type { AuthenticatedRequest } from '../auth.types.js';

const verifiedRequests = new WeakSet<AuthenticatedRequest>();

export function markLiveAuthorizationVerified(
  request: AuthenticatedRequest,
): void {
  verifiedRequests.add(request);
}

export function hasLiveAuthorizationBeenVerified(
  request: AuthenticatedRequest,
): boolean {
  return verifiedRequests.has(request);
}
