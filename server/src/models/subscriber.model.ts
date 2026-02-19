import { model } from 'mongoose';
import SUBSCRIBER_SCHEMA from '../schemas/subscriber.schema';
import { COLLECTION_NAMES } from '../constants/db';

const SUBSCRIBER = model(COLLECTION_NAMES.SUBSCRIBERS, SUBSCRIBER_SCHEMA);

export default SUBSCRIBER;
