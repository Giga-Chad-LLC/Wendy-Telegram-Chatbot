import { ChatMessage } from '@prisma/client';
import { UserRepository } from '../db/repositories/UserRepository';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { LlmDialogManager } from '../app/llm/conversation/LlmDialogManager';
import { LlmChatHistory } from '../app/llm/conversation/LlmChatHistory';
import { ChatMessageModel } from '../db/models/ChatMessageModel';
import { SystemLlmChatMessage, UserLlmChatMessage } from '../app/llm/providers/LlmProvider';
import { QuestionnaireRepository } from '../db/repositories/QuestionnaireRepository';
import { QuestionnaireModel } from '../db/models/QuestionnaireModel';
import { Persona, Wendy } from '../app/llm/prompt/configs/Personas';
import { ApplicationError } from '../app/errors/ApplicationError';
import { sliceArrayInGroupsByK } from '../app/utils/CollectionsUtils';

export type ConversationContinuationParams = {
  lastUserMessageContent: string;
  userId: number;
  persona: Persona;
}


export class LlmDialogController {
  // TODO: also create method for few-short prompting `startVeryFirstDialog() { ... }`

  private llmDialogManager: LlmDialogManager;

  private userRepository: UserRepository;
  private chatMessageRepository: ChatMessageRepository;
  private questionnaireRepository: QuestionnaireRepository;


  constructor(llmDialogManager: LlmDialogManager) {
    this.llmDialogManager = llmDialogManager;

    this.userRepository = new UserRepository();
    this.chatMessageRepository = new ChatMessageRepository();
    this.questionnaireRepository = new QuestionnaireRepository();
  }

  async converse({ lastUserMessageContent, userId, persona }: ConversationContinuationParams) {
    // retrieve data required for the system prompt
    const questionnaire = (await this.questionnaireRepository.getByUserId(userId));

    // user has not filled out the questionnaire => no LLM interaction allowed
    if (!questionnaire) {
      throw new ApplicationError(`User with id ${userId} did not fill out the questionnaire`);
    }

    const constructedHistory = await this.constructHistory({
      userId,
      questionnaire: new QuestionnaireModel(questionnaire),
      lastUserMessageContent,
      persona,
    });

    console.log(`History Crafted: messages count: ${constructedHistory.messages.length}`)
    console.log(`History's Initial System Prompt:\n"""${constructedHistory.initialSystemPrompt.content}\n"""`)
    console.log(`User's Last Message:\n"""${constructedHistory.lastMessage.content}\n"""`)

    // use current history to make conversation prompts
    // TODO: we need only LLM response message, it'll be saved into DB, no need in entire history
    const historyWithLlmResponse = await this.llmDialogManager.converse({ history: constructedHistory });

    // TODO(vartiukhov): [IMPORTANT] save LLM response from updatedHistory into database
    console.log(`Last LLM Message: "${historyWithLlmResponse.lastMessage.content}"`);
  }


  private async constructHistory({
    userId,
    questionnaire,
    lastUserMessageContent,
    persona,

  }: ConstructHistoryParams): Promise<LlmChatHistory> {
    try {
      // TODO: used as base case; for testing; need to find better way
      const emptyInitialSystemPrompt = this.llmDialogManager.createGeneralDialogInstructionPrompt({
        questionnaire: questionnaire,
        messagesToSummarize: [],
        recentMessages: [],
        lastUserMessage: lastUserMessageContent,
        persona: persona,
      });

      const newUserLlmMessage = new UserLlmChatMessage(lastUserMessageContent);

      // TODO: make sure it does not exceed the context or at least catch error
      let resultHistory: LlmChatHistory = new LlmChatHistory({
        messages: [newUserLlmMessage],
        initialSystemPrompt: new SystemLlmChatMessage(emptyInitialSystemPrompt),
        lastMessage: newUserLlmMessage,
      });

      // TODO: move consts somewhere else
      const summarizedMessagesCount = 15;
      const recentMessagesCount = 10;
      const limit = summarizedMessagesCount + recentMessagesCount;
      let page = 1;

      // TODO: create strategy/policy pattern and move algo there
      let ableToExtendHistory = true;

      while (ableToExtendHistory) {
        let messages = await this.chatMessageRepository.getPaginatedSortedMessages({
          userId: userId,
          field: "sent", // newest messages first
          ascending: true,
          page: page,
          limit: limit,
        });

        // check whether there are messages between user and assistant on current page
        if (messages.length > 0) {
          const {
            firstGroup: recentMessages,
            secondGroup: messagesToSummarize,
          } = sliceArrayInGroupsByK({ items: messages, firstGroupSize: recentMessagesCount });

          // craft initial prompt for history
          const initialSystemPrompt = this.llmDialogManager.createGeneralDialogInstructionPrompt({
            questionnaire: questionnaire,
            messagesToSummarize: messagesToSummarize.map(msg => new ChatMessageModel(msg)),
            recentMessages: recentMessages.map(msg => new ChatMessageModel(msg)),
            lastUserMessage: lastUserMessageContent,
            persona: persona,
          });

          const extendedHistory = new LlmChatHistory({
            messages: [newUserLlmMessage],
            initialSystemPrompt: new SystemLlmChatMessage(initialSystemPrompt),
            lastMessage: newUserLlmMessage,
          });

          if (!this.llmDialogManager.isTokenLimitExceeded(extendedHistory)) {
            resultHistory = extendedHistory;
          }
          else {
            ableToExtendHistory = false;
          }

          // preparing to retrieve next page on next loop iteration
          page += 1;
        }
        else {
          ableToExtendHistory = false;
        }
      }

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

type ConstructHistoryParams = {
  userId: number;
  questionnaire: QuestionnaireModel,
  lastUserMessageContent: string,
  persona: Persona,
};
