/**
 * POST /api/subscriber/subscribe - Subscribe an email to newsletter
 * @param {string} email - Email address (body param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import SUBSCRIBER from '../../models/subscriber.model.js';
import { sendResponse } from '../../utils/response.js';
import { EMAIL_REGEX } from '../../utils/regex.js';

const subscribeEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.body;
  if (!email) {
    return sendResponse(res, 400, 'Email is required');
  }
  if (!EMAIL_REGEX.test(email)) {
    return sendResponse(res, 400, 'Invalid email');
  }

  try {
    let subscriber = await SUBSCRIBER.findOne({ email });
    if (subscriber) {
      if (subscriber.is_subscribed) {
        return sendResponse(
          res,
          200,
          'You are already subscribed to our newsletter'
        );
      }

      // Resubscribe the existing subscriber
      subscriber.is_subscribed = true;
      subscriber.set('unsubscribed_at', undefined, { strict: false });

      await subscriber.save();
      return sendResponse(
        res,
        200,
        'You have been resubscribed to our newsletter'
      );
    }

    // New subscriber
    subscriber = new SUBSCRIBER({ email });
    await subscriber.save();
    return sendResponse(
      res,
      201,
      'Thank you for subscribing to our newsletter'
    );
  } catch (error) {
    return sendResponse(
      res,
      500,
      (error as Error).message || 'Internal Server Error'
    );
  }
};

export default subscribeEmail;
