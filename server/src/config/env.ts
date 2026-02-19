// Load environment variables from .env file
import * as dotenv from 'dotenv';

dotenv.config();

// Server Configuration
export const PORT: string | number = process.env.PORT || 8000;
export const SERVER_ENV: string = process.env.SERVER_ENV || 'development';
export const VITE_SERVER_DOMAIN: string =
  process.env.VITE_SERVER_DOMAIN || 'http://localhost:8000';
export const VITE_CLIENT_DOMAIN: string =
  process.env.VITE_CLIENT_DOMAIN || 'http://localhost:5173';

// MongoDB Configuration
export const MONGODB_URL: string =
  process.env.MONGODB_URL || 'mongodb://localhost:27017/code-a2z';

// JWT Configuration
export const JWT_SECRET_ACCESS_KEY: string =
  process.env.JWT_SECRET_ACCESS_KEY || 'default_secret_key';
export const JWT_ACCESS_EXPIRES_IN: string =
  process.env.JWT_ACCESS_EXPIRES_IN || '15m';
export const JWT_ACCESS_EXPIRES_IN_NUM: number =
  Number(process.env.JWT_ACCESS_EXPIRES_IN_NUM) || 15 * 60 * 1000; // 15 minutes in ms

export const JWT_SECRET_REFRESH_KEY: string =
  process.env.JWT_SECRET_REFRESH_KEY || 'default_refresh_secret_key';
export const JWT_REFRESH_EXPIRES_IN: string =
  process.env.JWT_REFRESH_EXPIRES_IN || '7d';
export const JWT_REFRESH_EXPIRES_IN_NUM: number =
  Number(process.env.JWT_REFRESH_EXPIRES_IN_NUM) || 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// Cloudinary Configuration (for media uploads)
export const CLOUDINARY_CLOUD_NAME: string =
  process.env.CLOUDINARY_CLOUD_NAME || 'admin';
export const CLOUDINARY_API_KEY: string =
  process.env.CLOUDINARY_API_KEY || 'admin';
export const CLOUDINARY_API_SECRET: string =
  process.env.CLOUDINARY_API_SECRET || 'admin';

//  Resend / Email Configuration
export const ADMIN_EMAIL: string =
  process.env.ADMIN_EMAIL || 'dev.admin@example.com';
export const RESEND_API_KEY: string =
  process.env.RESEND_API_KEY || 'dev_resend_key_abc123';
