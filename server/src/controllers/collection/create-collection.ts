/**
 * POST /api/collection/create - Create a new collection
 * @param {string} collection_name - Name of the collection (body param)
 * @param {string} description - Description of the collection (body param)
 * @returns {Object} Created collection
 */

import { Request, Response } from 'express';
import COLLECTION from '../../models/collection.model.js';
import USER from '../../models/user.model.js';
import { sendResponse } from '../../utils/response.js';

const createCollection = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { collection_name, description } = req.body;

    if (collection_name.trim().length < 2) {
      return sendResponse(
        res,
        400,
        'Collection name must be at least 2 characters long'
      );
    }

    if (description && description.length > 200) {
      return sendResponse(
        res,
        400,
        'Description must be at most 200 characters long'
      );
    }

    // Check for duplicate collection name for the same user
    const existing_collection = await COLLECTION.findOne({
      user_id,
      collection_name: collection_name.trim(),
    });
    if (existing_collection) {
      return sendResponse(
        res,
        400,
        `Collection '${collection_name}' already exists.`
      );
    }

    // Create new collection
    const new_collection = await COLLECTION.create({
      user_id,
      collection_name,
      description,
    });

    // Push the collection into user's collections array
    const user = await USER.findByIdAndUpdate(
      user_id,
      { $push: { collection_ids: new_collection._id } },
      { new: true }
    ).select('personal_info.fullname');

    if (!user) {
      return sendResponse(res, 404, 'User not found');
    }

    return sendResponse(
      res,
      201,
      `${collection_name} collection created successfully!`,
      new_collection
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default createCollection;
