import { Resend } from 'resend';
import { RESEND_API_KEY } from './env.js';

if (!RESEND_API_KEY) {
  throw new Error('Resend API key is not set in environment variables.');
}

const resend = new Resend(RESEND_API_KEY);

export default resend;
