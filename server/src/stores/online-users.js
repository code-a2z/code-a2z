/**
 * In-memory store for online (chat) presence.
 * Now integrated with Socket.IO for real-time presence tracking.
 */

const PRESENCE_TTL_MS = 2 * 60 * 1000; // 2 minutes

/** @type {Map<string, number>} */
const presenceMap = new Map();

/**
 * Mark user as online (refresh lastSeen).
 * @param {string} userId
 */
export const setPresence = userId => {
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

/**
 * Remove user from presence map (called on disconnect)
 * @param {string} userId
 */
export const removePresence = userId => {
  if (!userId) return;
  presenceMap.delete(String(userId));
};
