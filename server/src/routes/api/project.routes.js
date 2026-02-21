import express from 'express';

import authenticateUser, {
  requireOrgScope,
} from '../../middlewares/auth.middleware.js';

import createProject from '../../controllers/project/create-project.js';
import getAllProjects from '../../controllers/project/get-all-projects.js';
import trendingProjects from '../../controllers/project/trending-projects.js';
import totalPublishedProjects from '../../controllers/project/total-projects-count.js';
import searchProjects from '../../controllers/project/search-projects.js';
import searchProjectsCount from '../../controllers/project/search-projects-count.js';
import userProjects from '../../controllers/project/user-projects.js';
import userProjectsCount from '../../controllers/project/user-projects-count.js';
import getProject from '../../controllers/project/get-project.js';
import deleteProject from '../../controllers/project/delete-project.js';

const projectRoutes = express.Router();

projectRoutes.post('/', authenticateUser, requireOrgScope, createProject);
projectRoutes.get('/', getAllProjects);
projectRoutes.get('/trending', trendingProjects);
projectRoutes.get('/count', totalPublishedProjects);
projectRoutes.get('/search', searchProjects);
projectRoutes.get('/search/count', searchProjectsCount);
projectRoutes.get('/user', authenticateUser, requireOrgScope, userProjects);
projectRoutes.get(
  '/user/count',
  authenticateUser,
  requireOrgScope,
  userProjectsCount
);
projectRoutes.get('/:project_id', getProject);
projectRoutes.delete(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  deleteProject
);

export default projectRoutes;
