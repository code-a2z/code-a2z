import { model } from 'mongoose';
import MESSAGE_SCHEMA from '../schemas/message.schema.js';
import { COLLECTION_NAMES } from '../constants/db.js';

const MESSAGE = model(COLLECTION_NAMES.MESSAGES, MESSAGE_SCHEMA);

export default MESSAGE;
