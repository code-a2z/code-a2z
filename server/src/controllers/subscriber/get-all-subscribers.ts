/**
 * GET /api/subscriber - Get all active subscribers
 * @returns {Object[]} Array of subscribers
 */

import { Request, Response } from 'express';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { sendResponse } from '../../utils/response.js';

const getAllSubscribers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const subscribers = await SUBSCRIBER.find({ is_subscribed: true })
      .select('email subscribed_at')
      .sort({ subscribed_at: -1 });

    return sendResponse(res, 200, 'Fetched all subscribers', subscribers);
  } catch (error) {
    return sendResponse(
      res,
      500,
      (error as Error).message || 'Internal Server Error'
    );
  }
};

export default getAllSubscribers;
