/**
 * POST /api/feedback/submit - Submit user feedback
 * @param {string} title - Short and descriptive title (5-200 chars)
 * @param {string} details - Detailed description (10-2000 chars)
 * @param {string} category - Feedback category ('articles', 'chats', 'code')
 * @param {string} reproduce_steps - Optional steps to reproduce issue
 * @param {file} attachment - Optional image file upload
 * @returns {Object} Created feedback object
 */

import { Request, Response } from 'express';
import FEEDBACK from '../../models/feedback.model.js';
import { sendResponse } from '../../utils/response.js';
import cloudinary from '../../config/cloudinary.js';
import { nanoid } from 'nanoid';
import { FEEDBACK_STATUS, FEEDBACK_CATEGORY } from '../../typings/index.js';

const submitFeedback = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { title, details, category, reproduce_steps } = req.body;
  const file = req.file;

  if (!title || title.length < 5 || title.length > 200) {
    return sendResponse(res, 400, 'Title must be between 5 and 200 characters');
  }
  if (!details || details.length < 10 || details.length > 2000) {
    return sendResponse(
      res,
      400,
      'Details must be between 10 and 2000 characters'
    );
  }
  if (!Object.values(FEEDBACK_CATEGORY).includes(category)) {
    return sendResponse(res, 400, 'Invalid category');
  }

  try {
    let attachment_url = '';
    let attachment_public_id = '';

    if (file) {
      try {
        const uniqueFileName = `feedback-${nanoid()}-${Date.now()}`;
        const result = await cloudinary.uploader.upload(file.path, {
          public_id: uniqueFileName,
          folder: 'feedback_attachments',
          resource_type: 'image',
        });

        attachment_url = result.secure_url;
        attachment_public_id = result.public_id;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        return sendResponse(res, 500, 'Failed to upload attachment');
      }
    }

    const feedback = await FEEDBACK.create({
      user_id: req.user!.user_id,
      title,
      details,
      category,
      reproduce_steps,
      attachment_url,
      attachment_public_id,
      status: FEEDBACK_STATUS.PENDING,
    });

    return sendResponse(res, 201, 'Thanks for sharing your feedback', {
      feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return sendResponse(res, 500, 'Server Error', {
      error: (error as Error).message,
    });
  }
};

export default submitFeedback;
