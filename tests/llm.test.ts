import { describe, expect, it } from 'vitest';
import { OpenAILlmProvider } from '../src/app/llm/providers/OpenAILlmProvider';
import { Questionnaire } from '../src/db/models/Questionnaire';
import { LlmDialog } from '../src/app/llm/conversation/LlmDialog';
import { ChatMessage, ChatMessageRole } from '../src/db/models/ChatMessage';
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
    const llmDialog = new LlmDialog(llmProvider);

    const questionnaire = new Questionnaire({
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

    const lastUserChatMessage = new ChatMessage({
      id: 1,
      userId: 1,
      dto: {
        text: "Hello! Today I had a great day. I played football with my friends and hit 3 goals! Our team won over 2 goals!",
        summary: "",
        role: ChatMessageRole.USER,
        sent: new Date(),
        lastEdited: new Date(),
      }
    });

    const response = await llmDialog.startColdConversationWithFewShotPrompting({
      lastUserChatMessage: lastUserChatMessage.dto.text,
      questionnaire: questionnaire,
      persona: new Wendy(),
    });

    console.log(`=============== finalResponse ===============\n${response}`);
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