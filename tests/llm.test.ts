import { describe, it, expect } from 'vitest';
import { OpenAILlmProvider } from '../src/llm/providers/OpenAILlmProvider';



describe('OpenAILlmProvider', () => {
  let provider: OpenAILlmProvider;

  beforeEach(() => {
    provider = new OpenAILlmProvider({
      token: process.env.OPENAI_API_KEY!,
      model: 'gpt-4'
    });
  });

  it('should return a correct message', async () => {
    const response = await provider.sendMessage('Hello!');
    console.log(response);
    expect(response).not.toBe('');
  });
});