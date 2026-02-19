import { v2 as cloudinary } from 'cloudinary';

import { NODE_ENV } from '../typings/index.js';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  SERVER_ENV,
} from '../config/env.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: SERVER_ENV === NODE_ENV.PRODUCTION,
});

export default cloudinary;
