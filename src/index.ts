import { PrismaClient } from '@prisma/client';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { OpenAILlmProvider } from './llm/OpenAILlmProvider';

// Mount variables from .env into process.env
dotenv.config();

// Small demo with Prisma: create a user in the database
const prisma = new PrismaClient();


async function main() {
  const llm = new OpenAILlmProvider({
    token: process.env['OPENAI_API_KEY']!!,
    model: 'gpt-4o',
  });

  const response: string = await llm.sendMessage("Write me what your name is");
  return new Promise<string>((res, rej) => {
    res(response);
  })
}

main().then(res => console.log(res));
