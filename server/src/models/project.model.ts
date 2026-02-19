import { model } from 'mongoose';
import PROJECT_SCHEMA from '../schemas/project.schema';
import { COLLECTION_NAMES } from '../constants/db';

const PROJECT = model(COLLECTION_NAMES.PROJECTS, PROJECT_SCHEMA);

export default PROJECT;
