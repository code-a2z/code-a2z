/**
 * In-memory store for online (chat) presence.
 * Keys: user_id (string), values: lastSeen (number timestamp).
 * When Socket.IO is added (sub-issue #1378), this can be replaced by Redis or socket-backed presence.
 */

const PRESENCE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/** @type {Map<string, number>} */
const presenceMap = new Map();

/**
 * Mark user as online (refresh lastSeen).
 * @param {string} userId
 */
export const setPresence = (userId) => {
  if (!userId) return;
  presenceMap.set(String(userId), Date.now());
};

/**
 * Remove stale entries and return list of user IDs currently considered online.
 * @returns {string[]}
 */
export const getOnlineUserIds = () => {
  const now = Date.now();
  const ids = [];
  for (const [id, lastSeen] of presenceMap.entries()) {
    if (now - lastSeen < PRESENCE_TTL_MS) {
      ids.push(id);
    } else {
      presenceMap.delete(id);
    }
  }
  return ids;
};
