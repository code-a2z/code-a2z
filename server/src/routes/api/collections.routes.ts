import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import createCollection from '../../controllers/collection/create-collection';
import saveProject from '../../controllers/collection/save-project';
import sortProject from '../../controllers/collection/sort-project';
import removeProject from '../../controllers/collection/remove-project';
import deleteCollection from '../../controllers/collection/delete-collection';

const collectionRoutes: Router = Router();

collectionRoutes.post('/', authenticateUser, createCollection);
collectionRoutes.post('/save-project', authenticateUser, saveProject);
collectionRoutes.get('/sort-projects', authenticateUser, sortProject);
collectionRoutes.patch('/remove-project', authenticateUser, removeProject);
collectionRoutes.delete('/:collection_id', authenticateUser, deleteCollection);

export default collectionRoutes;
