import { Router } from 'express';

import multerUpload from '../../middlewares/multer.middleware';
import authenticateUser from '../../middlewares/auth.middleware';

import uploadImage from '../../controllers/media/upload.image';

const mediaRoutes: Router = Router();

mediaRoutes.post(
  '/upload-image',
  authenticateUser,
  multerUpload.single('image'),
  uploadImage
);

export default mediaRoutes;
