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

export type TwoMessageHistoryConstructionPolicyCtorParams = {
  readonly messagesSplitPolicy: MessagesSplitByHalfPolicy;
  readonly chatMessageRepository: ChatMessageRepository;
  // TODO: used only for prompt creation, i.e. overhead, refactor so another class used for prompts
  readonly llmDialogManager: LlmDialogManager;
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
  }: TwoMessageHistoryConstructionPolicyCtorParams) {
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
          ascending: true,
          page: currentPage,
          limit: TwoMessageHistoryConstructionPolicy.MESSAGES_PAGE_LIMIT_PER_DB_REQUEST,
        });

        // check whether there are messages between user and assistant on current page
        if (messagesPage.length > 0) {
          const nextTotalMessages = [...totalMessages, ...messagesPage];
          const initialSystemPrompt = this.constructInitialInstructionPrompt(context, nextTotalMessages);

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

      // TODO: if totalMessages is empty then default to the strategy that collects as many messages as possible within a single page

      const initialSystemPrompt = this.constructInitialInstructionPrompt(context, totalMessages);
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

  private constructInitialInstructionPrompt(context: HistoryConstructionContext, messages: ChatMessage[]) {
    const { recentMessages, messagesToSummarize} = this.messagesSplitPolicy.split(messages);

    return this.llmDialogManager.createGeneralDialogInstructionPrompt({
      questionnaire: context.questionnaire,
      lastUserMessage: context.lastUserMessageContent,
      persona: context.persona,

      recentMessages: recentMessages.map(msg => new ChatMessageModel(msg)),
      messagesToSummarize: messagesToSummarize.map(msg => new ChatMessageModel(msg)),
    });
  }
}