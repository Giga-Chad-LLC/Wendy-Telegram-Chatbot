import { ChatMessage } from '@prisma/client';
import { UserRepository } from '../db/repositories/UserRepository';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { LlmDialogManager } from '../app/llm/conversation/LlmDialogManager';
import { LlmChatHistory } from '../app/llm/conversation/LlmChatHistory';
import { ChatMessageModel } from '../db/models/ChatMessageModel';
import { SystemLlmChatMessage, UserLlmChatMessage } from '../app/llm/providers/LlmProvider';
import { QuestionnaireRepository } from '../db/repositories/QuestionnaireRepository';
import { QuestionnaireModel } from '../db/models/QuestionnaireModel';
import { Wendy } from '../app/llm/prompt/configs/Personas';
import { ApplicationError } from '../app/errors/ApplicationError';
import { sliceArrayInGroupsByK } from '../app/utils/CollectionsUtils';

export type ConversationContinuationParams = {
  lastUserMessage: string;
  userId: number;
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

  async converse({ lastUserMessage, userId }: ConversationContinuationParams) {
    // retrieve data required for the system prompt
    const questionnaire = (await this.questionnaireRepository.getByUserId(userId));

    // user has not filled out the questionnaire => no LLM interaction allowed
    if (!questionnaire) {
      throw new ApplicationError(`User with id ${userId} did not fill out the questionnaire`);
    }

    // TODO: no hard-coding!
    const persona = new Wendy();

    const newUserLlmMessage = new UserLlmChatMessage(lastUserMessage);

    // TODO: used as base case; for testing; need to find better way
    const emptyInitialSystemPrompt = this.llmDialogManager.createGeneralDialogInstructionPrompt({
      questionnaire: new QuestionnaireModel(questionnaire),
      messagesToSummarize: [],
      recentMessages: [],
      lastUserMessage: lastUserMessage,
      persona: persona,
    });

    // TODO: make sure it does not exceed the context or at least catch error
    let currentHistory: LlmChatHistory = new LlmChatHistory({
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
    let sufficientHistoryCrafted = false;
    while (!sufficientHistoryCrafted) {
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
          questionnaire: new QuestionnaireModel(questionnaire),
          messagesToSummarize: messagesToSummarize.map(msg => new ChatMessageModel(msg)),
          recentMessages: recentMessages.map(msg => new ChatMessageModel(msg)),
          lastUserMessage: lastUserMessage,
          persona: new Wendy(), // TODO: no hard-coding!
        });

        const newPotentialHistory = new LlmChatHistory({
          messages: [newUserLlmMessage],
          initialSystemPrompt: new SystemLlmChatMessage(initialSystemPrompt),
          lastMessage: newUserLlmMessage,
        });

        if (!this.llmDialogManager.isTokenLimitExceeded(newPotentialHistory)) {
          currentHistory = newPotentialHistory;
        }
        else {
          sufficientHistoryCrafted = true;
        }

        // preparing to retrieve next page on next loop iteration
        page += 1;
      }
      else {
        sufficientHistoryCrafted = true;
      }
    }

    console.log(`History Crafted: messages count: ${currentHistory.messages.length}`)
    console.log(`History's Initial System Prompt:\n"""${currentHistory.initialSystemPrompt.content}\n"""`)
    console.log(`User's Last Message:\n"""${currentHistory.lastMessage.content}\n"""`)

    // use current history to make conversation prompts
    // TODO: we need only LLM response message, it'll be saved into DB, no need in entire history
    const updatedHistory = await this.llmDialogManager.converse({ history: currentHistory });

    // TODO(vartiukhov): [IMPORTANT] save LLM response from updatedHistory into database
    console.log(`Last LLM Message: ${updatedHistory.lastMessage.content}`);
  }
}
