import { describe, expect, it } from 'vitest';
import { ChatMessageModel, ChatMessageRole } from '../src/db/models/ChatMessageModel';


describe('Database models', () => {
  it('ChatMessageRole correctly stringifies', async () => {
    expect(ChatMessageRole.USER as string).toBe('user');
    expect(ChatMessageRole.ASSISTANT as string).toBe('assistant');
  });

  it('ChatMessage correctly promptifies', async () => {
    const chatMessage = new ChatMessageModel({
      id: 1,
      userId: 1,
      dto: {
        text: "Hello! I am Nick and I what to get to know you better!",
        summary: "Nick wants to get to know you",
        role: ChatMessageRole.USER,
        sent: new Date(),
        lastEdited: new Date(),
      }
    });

    console.log(`Promptified message:\n"${chatMessage.promptify()}"`)
    console.log()
    console.log(`Promptified message summary:\n"${chatMessage.promptifyAsSummary()}"`)
  });
});