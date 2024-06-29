import { Markup, Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../../env';
import { message } from 'telegraf/filters';

const bot = new Telegraf(BOT_TOKEN!);

(async () => {
  bot.start((ctx) => {
    const firstName = ctx.update.message.from.first_name;
    ctx.reply(`Hello, ${firstName}!`);
  });

  bot.on(message(), (ctx) => {
    ctx.reply(`Вацок, ты че-то совсем не чувствуешь!`);
  });

  bot.help((ctx) => ctx.reply('Send me a sticker'));
  bot.hears('hi', (ctx) => ctx.reply('Hey there'));
  bot.launch();
  console.log('The bot was successfully launched!');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
