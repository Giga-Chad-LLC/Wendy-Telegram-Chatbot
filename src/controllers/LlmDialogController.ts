import { ChatMessage } from '@prisma/client';
import { UserRepository } from '../db/repositories/UserRepository';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { LlmDialogManager } from '../app/llm/conversation/LlmDialogManager';
import { LlmChatHistory } from '../app/llm/conversation/LlmChatHistory';
import {ChatMessage as ChatMessageModel } from '../db/models/ChatMessage';

export type ConversationContinuationParams = {
  lastUserMessage: string;
  userId: number;
}


export class LlmDialogController {
  // TODO: startVeryFirstDialog() { ... }
  private userRepository: UserRepository;
  private chatMessageRepository: ChatMessageRepository;
  private llmDialogManager: LlmDialogManager;

  constructor(llmDialogManager: LlmDialogManager) {
    this.llmDialogManager = llmDialogManager;
    this.userRepository = new UserRepository();
    this.chatMessageRepository = new ChatMessageRepository();
  }

  async converse({ lastUserMessage, userId }: ConversationContinuationParams) {
    // TODO: move consts somewhere else
    const summarizedMessagesCount = 15;
    const recentMessagesCount = 10;

    const limit = summarizedMessagesCount + recentMessagesCount;
    let page = 1;
    let messages: ChatMessage[];
    let potentialHistory: LlmChatHistory;

    /*do {
      let messages = await this.chatMessageRepository.getPaginatedSortedMessages({
        userId: userId,
        field: "sent" as keyof ChatMessage,
        ascending: true,
        page: page,
        limit: limit,
      });

      const recentMessages = messages.slice(recentMessagesCount);
      const messagesToSummarize = messages.slice(-summarizedMessagesCount);

      const initialSystemPrompt = this.llmDialogManager.createGeneralDialogInstructionPrompt({
        questionnaire: null,
        messagesToSummarize: messagesToSummarize.map(msg => TODO),
        recentMessages: recentMessages.map(msg => TODO),
        lastUserMessage: new ChatMessageModel(lastUserMessage),
      })

      page += 1;
    }
    // TODO: OR while select did not return 0 messages on the next page:
    while (this.llmDialogManager.isTokenLimitExceeded(potentialHistory));*/
  }
}