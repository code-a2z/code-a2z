import express from 'express';

import authenticateUser, {
  requireOrgScope,
  requirePermission,
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

const articlesRead = requirePermission('articles', 'read');
const articlesWrite = requirePermission('articles', 'write');
const articlesDelete = requirePermission('articles', 'delete');

projectRoutes.post(
  '/',
  authenticateUser,
  requireOrgScope,
  articlesWrite,
  createProject
);
projectRoutes.get(
  '/',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  getAllProjects
);
projectRoutes.get(
  '/trending',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  trendingProjects
);
projectRoutes.get(
  '/count',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  totalPublishedProjects
);
projectRoutes.get(
  '/search',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  searchProjects
);
projectRoutes.get(
  '/search/count',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  searchProjectsCount
);
projectRoutes.get(
  '/user',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  userProjects
);
projectRoutes.get(
  '/user/count',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  userProjectsCount
);
projectRoutes.get(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  articlesRead,
  getProject
);
projectRoutes.delete(
  '/:project_id',
  authenticateUser,
  requireOrgScope,
  articlesDelete,
  deleteProject
);

export default projectRoutes;
