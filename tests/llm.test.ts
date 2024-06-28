import { describe, it, expect } from 'vitest';
import { OpenAILlmProvider } from '../src/llm/providers/OpenAILlmProvider';
import { FewShotPromptingStrategy } from '../src/llm/prompt/strategy/FewShotPromptingStrategy';
import { Questionnaire } from '../src/model/data/Questionnaire';



describe('OpenAILlmProvider', () => {
  let llmProvider: OpenAILlmProvider;

  beforeEach(() => {
    llmProvider = new OpenAILlmProvider({
      token: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o'
    });
  });

  it('should return a correct message', async () => {
    const response = await llmProvider.sendMessage('Hello!');
    console.log(response);
    expect(response).not.toBe('');
  });

  it('should send two prompts', async () => {
    const strategy = new FewShotPromptingStrategy()
    const questionnaire = new Questionnaire({
      preferredName: 'Alphard',
      isAdult: false,
      age: 12,
      residenceCountry: 'USA',
      // residenceCity: undefined,
      bio: 'Hello! I am Alphard. I am from USA. I love baseball and football. I have some struggles at school; I am being bullied by classmates. I want to overcome this and make them get off me.',
    })

    const response = await strategy.prompt(llmProvider, questionnaire);
    console.log(`=============== finalResponse ===============\n${response}`);

  }, -1);
});