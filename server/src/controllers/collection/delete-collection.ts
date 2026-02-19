/**
 * DELETE /api/collection/:collection_id - Delete a collection
 * @param {string} collection_id - Collection ID (URL param)
 * @returns {Object} Success message
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import COLLECTION from '../../models/collection.model.js';
import { sendResponse } from '../../utils/response.js';

const deleteCollection = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user_id = req.user!.user_id;
    const { collection_id } = req.params;

    if (
      !collection_id ||
      Array.isArray(collection_id) ||
      !Types.ObjectId.isValid(collection_id)
    ) {
      return sendResponse(res, 400, 'Invalid or missing collection_id');
    }

    const deleted_collection = await COLLECTION.findOneAndDelete({
      user_id,
      _id: collection_id,
    });

    if (!deleted_collection) {
      return sendResponse(res, 404, 'Collection not found');
    }

    return sendResponse(
      res,
      200,
      `${deleted_collection.collection_name} collection deleted successfully!`
    );
  } catch (err) {
    return sendResponse(
      res,
      500,
      (err as Error).message || 'Internal Server Error'
    );
  }
};

export default deleteCollection;
