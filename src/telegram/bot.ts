import { Markup, Telegraf } from 'telegraf';
import { BOT_TOKEN } from '../../env';
import { message } from 'telegraf/filters';

const bot = new Telegraf(BOT_TOKEN!);

(async () => {
  bot.start((ctx) => {
    const firstName = ctx.update.message.from.first_name;
    ctx.reply(`Hello, ${firstName}!`);
  });

  bot.command('admin', async (ctx) => {
    return ctx.reply(
      'open webapp',
      Markup.keyboard([
        Markup.button.webApp(
          'Admin panel',
          'https://bagi4-source.github.io/Wendy-WebApp/',
        ),
      ]),
    );
  });

  bot.on(message('web_app_data'), async (ctx) => {
    if (!ctx.webAppData) return;
    const data = ctx.webAppData.data.json();
    const text = ctx.webAppData.data.text();
    console.log(data, text);
  });

  bot.help((ctx) => ctx.reply('Send me a sticker'));
  bot.hears('hi', (ctx) => ctx.reply('Hey there'));
  bot.launch();
  console.log('The bot was successfully launched!');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
