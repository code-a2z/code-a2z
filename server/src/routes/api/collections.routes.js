import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
} from '../../middlewares/auth.middleware.js';

import createCollection from '../../controllers/collection/create-collection.js';
import saveProject from '../../controllers/collection/save-project.js';
import sortProject from '../../controllers/collection/sort-project.js';
import removeProject from '../../controllers/collection/remove-project.js';
import deleteCollection from '../../controllers/collection/delete-collection.js';

const collectionRoutes = express.Router();

const notesRead = requirePermission('notes', 'read');
const notesWrite = requirePermission('notes', 'write');
const notesDelete = requirePermission('notes', 'delete');

collectionRoutes.post(
  '/',
  authenticateUser,
  requireOrgScope,
  notesWrite,
  createCollection
);
collectionRoutes.post(
  '/save-project',
  authenticateUser,
  requireOrgScope,
  notesWrite,
  saveProject
);
collectionRoutes.get(
  '/sort-projects',
  authenticateUser,
  requireOrgScope,
  notesRead,
  sortProject
);
collectionRoutes.patch(
  '/remove-project',
  authenticateUser,
  requireOrgScope,
  notesWrite,
  removeProject
);
collectionRoutes.delete(
  '/:collection_id',
  authenticateUser,
  requireOrgScope,
  notesDelete,
  deleteCollection
);

export default collectionRoutes;
