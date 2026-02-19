import multer, { StorageEngine } from 'multer';

const multerStorage: StorageEngine = multer.diskStorage({
  filename: (_req, file, cb) => {
    cb(null, file.originalname + '-' + Date.now());
  },
});

const multerUpload = multer({ storage: multerStorage });

export default multerUpload;
