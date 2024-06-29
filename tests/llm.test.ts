import { describe, expect, it } from 'vitest';
import { OpenAILlmProvider } from '../src/app/llm/providers/OpenAILlmProvider';
import { QuestionnaireModel } from '../src/db/models/QuestionnaireModel';
import { LlmDialogManager } from '../src/app/llm/conversation/LlmDialogManager';
import { LlmChatMessageRole } from '../src/app/llm/providers/LlmProvider';
import { Wendy } from '../src/app/llm/prompt/configs/Personas';


describe('OpenAILlmProvider', () => {
  let llmProvider: OpenAILlmProvider;

  beforeEach(() => {
    llmProvider = new OpenAILlmProvider({
      token: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o'
    });
  });

  it('should return a non-empty message', async () => {
    const response = await llmProvider.sendMessage('Hello!');
    console.log(response);
    expect(response).not.toBe('');
  });

  it('should send two prompts', async () => {
    const llmDialog = new LlmDialogManager(llmProvider);

    const questionnaire = new QuestionnaireModel({
      id: 1,
      userId: 1,
      dto: {
        preferredName: 'Alphard',
        isAdult: false,
        age: 12,
        residenceCountry: 'USA',
        residenceCity: null,
        bio: 'Hello! I am Alphard. I am from USA. I love baseball and football. I have some struggles at school; I am being bullied by classmates. I want to overcome this and make them get off me.',
      },
    })

    /*const lastUserChatMessage = new ChatMessage({
      id: 1,
      userId: 1,
      dto: {
        text: "Hello! Today I had a great day. I played football with my friends and hit 3 goals! Our team won over 2 goals!",
        summary: "",
        role: ChatMessageRole.USER,
        sent: new Date(),
        lastEdited: new Date(),
      }
    });*/

    const history = await llmDialog.startColdConversationWithFewShotPrompting({
      questionnaire: questionnaire,
      persona: new Wendy(),
    });

    console.log(`=============== finalResponse ===============\n${history.lastMessage.content}`);
  }, -1);


  it('count tokens from messages', async () => {
    const tokensCount = llmProvider.countMessagesTokens([{ role: LlmChatMessageRole.USER, content: "Hello! my name is Fred. I want to become your friend!" }]);
    console.log(`Tokens count: ${tokensCount}`);
    expect(tokensCount).toBeGreaterThanOrEqual(0);
  });

  it('count tokens from text', async () => {
    const tokensCount = llmProvider.countTextTokens("Hello! my name is Fred. I want to become your friend!");
    console.log(`Tokens count: ${tokensCount}`);
    expect(tokensCount).toBeGreaterThanOrEqual(0);
  });
});