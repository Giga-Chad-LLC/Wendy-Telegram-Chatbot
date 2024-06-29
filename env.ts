import env from 'env-var';
import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = env
  .get('BOT_TOKEN')
  .required()
  .asString();