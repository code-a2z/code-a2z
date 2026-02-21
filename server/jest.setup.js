/** Ensure test DB URL is set before any app code loads (optional override via env). */
if (!process.env.MONGODB_URL) {
  process.env.MONGODB_URL = 'mongodb://localhost:27017/code_a2z_test';
}
