import { Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../../env';
import { message } from 'telegraf/filters';
import { WebAppDataDto } from './WebAppData.dto';
import { UserRepository } from '../db/repositories/UserRepository';

const bot = new Telegraf(BOT_TOKEN!);
const userRepository = new UserRepository();

(async () => {
  bot.start(async (ctx) => {
    const userData = ctx.update.message.from;
    try {
      await userRepository.create({
        telegramFirstName: userData.first_name,
        telegramLastName: userData.last_name ?? '',
        telegramUserId: userData.id,
        telegramChatId: ctx.update.message.chat.id,
        since: new Date(),
      });
    } catch {}
    await ctx.reply(`Hello, ${userData.first_name}!`);
  });
  bot.help((ctx) => ctx.reply('Send me a sticker'));
  bot.hears('hi', (ctx) => ctx.reply('Hey there'));

  bot.on(message('web_app_data'), async (ctx) => {
    if (!ctx.webAppData) return;
    try {
      const data: WebAppDataDto = ctx.webAppData.data.json();
      switch (data.event) {
        case 'FIRST_QUESTIONNAIRE_CREATE': {
          ctx.reply('FIRST_QUESTIONNAIRE_CREATE');
        }
        case 'NOTIFICATION_CHANGE': {
          ctx.reply('NOTIFICATION_CHANGE');
        }
      }
    } catch {}
  });

  bot.on(message(), (ctx) => {
    ctx.reply(`Вацок, ты че-то совсем не чувствуешь!`);
  });
  bot.launch();
  console.log('The bot was successfully launched!');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
