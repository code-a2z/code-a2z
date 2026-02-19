import { Router } from 'express';

import authenticateUser from '../../middlewares/auth.middleware';

import addComment from '../../controllers/comment/add-comment';
import getComments from '../../controllers/comment/get-comments';
import getReplies from '../../controllers/comment/get-replies';
import deleteComment from '../../controllers/comment/delete-comment';

const commentRoutes: Router = Router();

commentRoutes.post('/', authenticateUser, addComment);
commentRoutes.get('/', getComments);
commentRoutes.get('/replies', getReplies);
commentRoutes.delete('/:comment_id', authenticateUser, deleteComment);

export default commentRoutes;
