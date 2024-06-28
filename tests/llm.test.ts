import { describe, it, expect } from 'vitest';
import { OpenAILlmProvider } from '../src/llm/providers/OpenAILlmProvider';
import { Questionnaire } from '../src/db/models/Questionnaire';
import { LlmDialog } from '../src/llm/conversation/LlmDialog';
import { ChatMessage, ChatMessageDto } from '../src/db/models/ChatMessage';



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
      preferredName: 'Alphard',
      isAdult: false,
      age: 12,
      residenceCountry: 'USA',
      // residenceCity: undefined,
      bio: 'Hello! I am Alphard. I am from USA. I love baseball and football. I have some struggles at school; I am being bullied by classmates. I want to overcome this and make them get off me.',
    })

    const lastUserChatMessage = new ChatMessage(new ChatMessageDto());
    const response = await llmDialog.startColdConversationWithFewShotPrompting(lastUserChatMessage, questionnaire);

    console.log(`=============== finalResponse ===============\n${response}`);
  }, -1);
});