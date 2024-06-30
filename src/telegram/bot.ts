import { Telegraf } from 'telegraf';
import { BOT_TOKEN, OPENAI_API_KEY } from '../../env';
import { message } from 'telegraf/filters';
import { WebAppDataDto } from './WebAppData.dto';
import { UserRepository } from '../db/repositories/UserRepository';
import { commandDescriptions } from '../app/literals/CommandDescriptions';
import { LlmDialogController } from '../controllers/LlmDialogController';
import { LlmDialogManager } from '../app/llm/conversation/LlmDialogManager';
import { OpenAILlmProvider } from '../app/llm/providers/OpenAILlmProvider';
import { Wendy } from '../app/llm/prompt/configs/Personas';
import { QuestionnaireRepository } from '../db/repositories/QuestionnaireRepository';

const bot = new Telegraf(BOT_TOKEN!);
const userRepository = new UserRepository();

(async () => {
  const llmDialogController = (() => {
    const llmProvider = new OpenAILlmProvider({
      token: OPENAI_API_KEY,
      model: 'gpt-4o',
    });
    const llmDialogManager = new LlmDialogManager(llmProvider);

    return new LlmDialogController(llmDialogManager);
  })();

  const persona = new Wendy();


  bot.start(async (ctx) => {
    const userData = ctx.update.message.from;
    try {
      const user = await userRepository.getById(userData.id);

      // create or update user
      await userRepository.upsert({
        telegramFirstName: userData.first_name,
        telegramLastName: userData.last_name ?? '',
        telegramUserId: userData.id,
        telegramChatId: ctx.update.message.chat.id,
        // preserving 'since'
        since: user?.since ?? new Date(),
      });

      if (!user) {
        await ctx.reply(commandDescriptions.successfulRegistration);
      }
      else {
        await ctx.reply(commandDescriptions.alreadyRegistered);
      }
    } catch(error) {
      console.error(error);
      await ctx.reply(commandDescriptions.somethingWentWrong);
    }
  });

  bot.help((ctx) => {
    // TODO: use LLM to craft the header
    ctx.reply(commandDescriptions.helpCommandDescription);
  });

  // bot.hears('hi', (ctx) => ctx.reply('Hey there'));

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

  // general conversation
  // TODO: deprecated, user another API
  bot.on('text', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const message: string = ctx.message.text;

      // TODO: move to method
      // check existence of user's questionnaire
      const questionnaireRepository = new QuestionnaireRepository()
      const questionnaire = await questionnaireRepository.getByUserId(userId);

      if (!questionnaire) {
        await ctx.reply(commandDescriptions.fillOutQuestionnaireFirst);
        return;
      }

      // start typing
      await ctx.sendChatAction('typing');

      // saving user message to database
      await llmDialogController.saveUserMessage({ userId, message });

      // start typing if the previous stopped by timeout
      await ctx.sendChatAction('typing');

      const assistantLlmMessage = await llmDialogController
        .converse({
          userId,
          lastUserMessageContent: message,
          persona,
        });

      await ctx.reply(assistantLlmMessage.content);
    }
    catch (error) {
      console.error(error);
      await ctx.reply(commandDescriptions.somethingWentWrong);
    }
  });

  bot.launch();

  console.log('The bot was successfully launched!');
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
})();
