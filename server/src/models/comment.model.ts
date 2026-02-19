import { model } from 'mongoose';
import COMMENT_SCHEMA from '../schemas/comment.schema';
import { COLLECTION_NAMES } from '../constants/db';

const COMMENT = model(COLLECTION_NAMES.COMMENTS, COMMENT_SCHEMA);

export default COMMENT;
