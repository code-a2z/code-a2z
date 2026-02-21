import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import createCollection from '../../controllers/collection/create-collection.js';
import saveProject from '../../controllers/collection/save-project.js';
import sortProject from '../../controllers/collection/sort-project.js';
import removeProject from '../../controllers/collection/remove-project.js';
import deleteCollection from '../../controllers/collection/delete-collection.js';

const collectionRoutes = express.Router();

collectionRoutes.post('/', authenticateUser, requireOrgScope, createCollection);
collectionRoutes.post(
  '/save-project',
  authenticateUser,
  requireOrgScope,
  saveProject
);
collectionRoutes.get(
  '/sort-projects',
  authenticateUser,
  requireOrgScope,
  sortProject
);
collectionRoutes.patch(
  '/remove-project',
  authenticateUser,
  requireOrgScope,
  removeProject
);
collectionRoutes.delete(
  '/:collection_id',
  authenticateUser,
  requireOrgScope,
  deleteCollection
);

export default collectionRoutes;
