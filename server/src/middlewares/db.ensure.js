/**
 * Ensures MongoDB is connected before handling the request.
 * Required for serverless (e.g. Vercel) where the process does not run index.js,
 * so connectDB() is never called and Mongoose would otherwise buffer operations and time out.
 */
import { ensureConnected } from '../config/db.js';
import { sendResponse } from '../utils/response.js';

const ensureDb = async (req, res, next) => {
  try {
    await ensureConnected();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    return sendResponse(
      res,
      503,
      'Service temporarily unavailable. Please try again.'
    );
  }
};

export default ensureDb;
