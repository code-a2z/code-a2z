import { Request, Response, NextFunction, RequestHandler } from 'express';
import sanitizeHtml from 'sanitize-html';
import { sendResponse } from '../utils/response';

export const sanitizeNested = (obj: Record<string, any>): void => {
  for (const k in obj) {
    if (typeof obj[k] === 'string') {
      obj[k] = sanitizeHtml(obj[k], {
        allowedTags: [],
        allowedAttributes: {},
      });
    } else if (typeof obj[k] === 'object' && obj[k] !== null) {
      sanitizeNested(obj[k]);
    }
  }
};

const sanitizeInput = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const obj = req.body;
    try {
      if (obj && typeof obj === 'object') {
        sanitizeNested(obj);
      }
      next();
    } catch (e) {
      console.error('Sanitization Error:', e);
      sendResponse(res, 500, 'Failed to sanitize input fields');
    }
  };
};

export default sanitizeInput;
