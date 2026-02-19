import { model } from 'mongoose';
import FEEDBACK_SCHEMA from '../schemas/feedback.schema';
import { COLLECTION_NAMES } from '../constants/db';

const FEEDBACK = model(COLLECTION_NAMES.FEEDBACK, FEEDBACK_SCHEMA);

export default FEEDBACK;
