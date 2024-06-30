import { QuestionnaireModel } from '../../../../db/models/QuestionnaireModel';
import { Persona } from '../../prompt/configs/Personas';
import { LlmChatHistory } from '../LlmChatHistory';
import { MessagesSplitByHalfPolicy } from './MessagesSplitPolicies';
import { SystemLlmChatMessage, UserLlmChatMessage } from '../../providers/LlmProvider';
// TODO: migrate to ChatMessageModel!
import { ChatMessage } from '@prisma/client';
import { ChatMessageModel } from '../../../../db/models/ChatMessageModel';
import { ApplicationError } from '../../../errors/ApplicationError';
import { ChatMessageRepository } from '../../../../db/repositories/ChatMessageRepository';
import { LlmDialogManager } from '../LlmDialogManager';


interface HistoryConstructionContext {
  readonly userId: number,
  readonly questionnaire: QuestionnaireModel,
  readonly lastUserMessageContent: string,
  readonly persona: Persona,
}

export interface IHistoryConstructionPolicy {
  construct(context: HistoryConstructionContext): Promise<LlmChatHistory>;
}


// implementations
export type PolicyInitParams = {
  readonly messagesSplitPolicy: MessagesSplitByHalfPolicy;
  readonly chatMessageRepository: ChatMessageRepository;
  // TODO: used only for prompt creation, i.e. overhead, refactor so another class used for prompts
  readonly llmDialogManager: LlmDialogManager;

}



export class SingleMessagesPageConstructionPolicy implements IHistoryConstructionPolicy {
  private static readonly MESSAGES_PAGE_LIMIT_PER_DB_REQUEST = 20;

  private readonly messagesSplitPolicy: MessagesSplitByHalfPolicy;
  private readonly chatMessageRepository: ChatMessageRepository;
  readonly llmDialogManager: LlmDialogManager;

  constructor({
    messagesSplitPolicy,
    chatMessageRepository,
    llmDialogManager,
  }: PolicyInitParams) {
    this.messagesSplitPolicy = messagesSplitPolicy;
    this.chatMessageRepository = chatMessageRepository;
    this.llmDialogManager = llmDialogManager;
  }

  async construct(context: HistoryConstructionContext): Promise<LlmChatHistory> {
    const messages = await this.chatMessageRepository.getPaginatedSortedMessages({
      userId: context.userId,
      // we sort in the order to have the newest messages first
      field: "sent",
      ascending: false,
      page: 1,
      limit: SingleMessagesPageConstructionPolicy.MESSAGES_PAGE_LIMIT_PER_DB_REQUEST,
    });

    const newUserLlmMessage = new UserLlmChatMessage(context.lastUserMessageContent);

    do {
      const initialSystemPrompt = constructInitialInstructionPrompt({
        messagesSplitPolicy: this.messagesSplitPolicy,
        llmDialogManager: this.llmDialogManager,
        context,
        messages,
      });

      const llmChatMessages = [
        new SystemLlmChatMessage(initialSystemPrompt),
        newUserLlmMessage,
      ];

      // once messages fit the token limit break
      if (!this.llmDialogManager.isTokenLimitExceeded(llmChatMessages)) {
        break
      }

      // TODO: use binary search
      // remove once the oldest message and try again
      messages.pop();
    }
    while (messages.length > 0);

    const initialSystemPrompt = constructInitialInstructionPrompt({
      messagesSplitPolicy: this.messagesSplitPolicy,
      llmDialogManager: this.llmDialogManager,
      context,
      messages,
    });

    const resultHistory = new LlmChatHistory({
      messages: [newUserLlmMessage],
      initialSystemPrompt: new SystemLlmChatMessage(initialSystemPrompt),
      lastMessage: newUserLlmMessage,
    });

    return new Promise((resolve, reject) => resolve(resultHistory));
  }
}



export class TwoMessageHistoryConstructionPolicy implements IHistoryConstructionPolicy {
  private static readonly MESSAGES_PAGE_LIMIT_PER_DB_REQUEST = 20;

  private readonly messagesSplitPolicy: MessagesSplitByHalfPolicy;
  private readonly chatMessageRepository: ChatMessageRepository;
  readonly llmDialogManager: LlmDialogManager;

  constructor({
    messagesSplitPolicy,
    chatMessageRepository,
    llmDialogManager,
  }: PolicyInitParams) {
    this.messagesSplitPolicy = messagesSplitPolicy;
    this.chatMessageRepository = chatMessageRepository;
    this.llmDialogManager = llmDialogManager;
  }

  async construct(context: HistoryConstructionContext): Promise<LlmChatHistory> {
    try {
      const { userId, lastUserMessageContent } = context;

      const newUserLlmMessage = new UserLlmChatMessage(lastUserMessageContent);
      // list of messages that are used in the final llm chat history
      const totalMessages: ChatMessage[] = [];

      let currentPage = 1;
      let ableToConsumeMoreMessages = true;

      // paginating over the list of user's messages to collect into the llm chat history as many as possible
      while (ableToConsumeMoreMessages) {
        let messagesPage = await this.chatMessageRepository.getPaginatedSortedMessages({
          userId: userId,
          // we sort in the order to have the newest messages first
          field: "sent",
          ascending: false,
          page: currentPage,
          limit: TwoMessageHistoryConstructionPolicy.MESSAGES_PAGE_LIMIT_PER_DB_REQUEST,
        });

        // check whether there are messages between user and assistant on current page
        if (messagesPage.length > 0) {
          const nextTotalMessages = [...totalMessages, ...messagesPage];

          const initialSystemPrompt = constructInitialInstructionPrompt({
            messagesSplitPolicy: this.messagesSplitPolicy,
            llmDialogManager: this.llmDialogManager,
            context,
            messages: nextTotalMessages,
          });

          const llmChatMessages = [
            new SystemLlmChatMessage(initialSystemPrompt),
            newUserLlmMessage,
          ];

          // TODO: we need to fit the input token limit, not the total one!
          // number messages of is small enough to fix the context
          if (!this.llmDialogManager.isTokenLimitExceeded(llmChatMessages)) {
            // add current page of messages to the total messages list for the context
            totalMessages.push(...messagesPage);
          }
          else {
            ableToConsumeMoreMessages = false;
          }

          // preparing to retrieve next page on next loop iteration
          currentPage += 1;
        }
        else {
          ableToConsumeMoreMessages = false;
        }
      }

      // TODO: test this moment + provide fallback policy in ctor
      /**
       * Use fallback strategy if the current once did not manage to collect any messages for context.
       */
      if (totalMessages.length <= 0) {
        const fallbackPolicy = new SingleMessagesPageConstructionPolicy({
          messagesSplitPolicy: this.messagesSplitPolicy,
          chatMessageRepository: this.chatMessageRepository,
          llmDialogManager: this.llmDialogManager,
        });
        return fallbackPolicy.construct(context);
      }

      const initialSystemPrompt = constructInitialInstructionPrompt({
        messagesSplitPolicy: this.messagesSplitPolicy,
        llmDialogManager: this.llmDialogManager,
        context,
        messages: totalMessages,
      });

      const resultHistory = new LlmChatHistory({
        messages: [newUserLlmMessage],
        initialSystemPrompt: new SystemLlmChatMessage(initialSystemPrompt),
        lastMessage: newUserLlmMessage,
      });

      return new Promise((resolve, _) => resolve(resultHistory));
    }
    catch (error) {
      return new Promise((_, reject) => {
        const applicationError = new ApplicationError(
          'Unable to construct history according to the algorithm', error as Error)
        reject(applicationError);
      });
    }
  }
}


// TODO: find better location

type InitialPromptConstructionParams = {
  messagesSplitPolicy: MessagesSplitByHalfPolicy,
  llmDialogManager: LlmDialogManager,
  context: HistoryConstructionContext,
  messages: ChatMessage[]
};

function constructInitialInstructionPrompt({
  messagesSplitPolicy,
  llmDialogManager,
  context,
  messages,
}: InitialPromptConstructionParams): string {
  const { recentMessages, messagesToSummarize} = messagesSplitPolicy.split(messages);

  return llmDialogManager.createGeneralDialogInstructionPrompt({
    questionnaire: context.questionnaire,
    lastUserMessage: context.lastUserMessageContent,
    persona: context.persona,

    /**
     * Reverse is required to have the oldest messages be rendered upper and newest lower in the prompt sequence
     */
    recentMessages: recentMessages.reverse().map(msg => new ChatMessageModel(msg)),
    messagesToSummarize: messagesToSummarize.reverse().map(msg => new ChatMessageModel(msg)),
  });
}