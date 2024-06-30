import env from 'env-var';
import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = env
  .get('BOT_TOKEN')
  .required()
  .asString();

export const OPENAI_API_KEY = env
  .get('OPENAI_API_KEY')
  .required()
  .asString();

export const ENCRYPTION_KEY = env
  .get('ENCRYPTION_KEY')
  .asString();