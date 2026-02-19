import { Response } from 'express';

export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const RESPONSE_STATUS_CODES: Record<number, string> = {
  200: RESPONSE_STATUS.SUCCESS, // OK
  201: RESPONSE_STATUS.SUCCESS, // Created
  202: RESPONSE_STATUS.SUCCESS, // Accepted
  203: RESPONSE_STATUS.SUCCESS, // Non-Authoritative Information
  204: RESPONSE_STATUS.SUCCESS, // No Content
  400: RESPONSE_STATUS.ERROR, // Bad Request
  401: RESPONSE_STATUS.ERROR, // Unauthorized
  403: RESPONSE_STATUS.ERROR, // Forbidden
  404: RESPONSE_STATUS.ERROR, // Not Found
  500: RESPONSE_STATUS.ERROR, // Internal Server Error
};

export const sendResponse = <T = unknown>(
  res: Response,
  code: number,
  message: string,
  data: T | null = null
): Response => {
  return res.status(code).json({
    status: RESPONSE_STATUS_CODES[code],
    message,
    ...(data ? { data } : {}),
  });
};
