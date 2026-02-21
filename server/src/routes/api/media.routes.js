import express from 'express';

import multerUpload from '../../middlewares/multer.middleware.js';
import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import uploadImage from '../../controllers/media/upload.image.js';

const mediaRoutes = express.Router();

mediaRoutes.post(
  '/upload-image',
  authenticateUser,
  requireOrgScope,
  multerUpload.single('image'),
  uploadImage
);

export default mediaRoutes;
