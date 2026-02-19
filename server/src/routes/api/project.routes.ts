import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import createProject from '../../controllers/project/create-project';
import getAllProjects from '../../controllers/project/get-all-projects';
import trendingProjects from '../../controllers/project/trending-projects';
import totalPublishedProjects from '../../controllers/project/total-projects-count';
import searchProjects from '../../controllers/project/search-projects';
import searchProjectsCount from '../../controllers/project/search-projects-count';
import userProjects from '../../controllers/project/user-projects';
import userProjectsCount from '../../controllers/project/user-projects-count';
import getProject from '../../controllers/project/get-project';
import deleteProject from '../../controllers/project/delete-project';

const projectRoutes: Router = Router();

projectRoutes.post('/', authenticateUser, createProject);
projectRoutes.get('/', getAllProjects);
projectRoutes.get('/trending', trendingProjects);
projectRoutes.get('/count', totalPublishedProjects);
projectRoutes.get('/search', searchProjects);
projectRoutes.get('/search/count', searchProjectsCount);
projectRoutes.get('/user', authenticateUser, userProjects);
projectRoutes.get('/user/count', authenticateUser, userProjectsCount);
projectRoutes.get('/:project_id', getProject);
projectRoutes.delete('/:project_id', authenticateUser, deleteProject);

export default projectRoutes;
