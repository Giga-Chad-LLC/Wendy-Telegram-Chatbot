import { PrismaClient } from '@prisma/client';
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { OpenAILlmProvider } from './llm/providers/OpenAILlmProvider';

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


const bot = new Telegraf(process.env.BOT_TOKEN!);
/*
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

*/