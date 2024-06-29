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
import { MessagesSplitByHalfPolicy } from '../app/llm/conversation/policies/MessagesSplitPolicies';
import {
  IHistoryConstructionPolicy,
  TwoMessageHistoryConstructionPolicy,
} from '../app/llm/conversation/policies/IHistoryConstructionPolicies';

export type ConversationContinuationParams = {
  lastUserMessageContent: string;
  userId: number;
  persona: Persona;
}


export class LlmDialogController {
  // TODO: also create method for few-short prompting `startVeryFirstDialog() { ... }`

  private readonly llmDialogManager: LlmDialogManager;
  private readonly historyConstructionPolicy: IHistoryConstructionPolicy;

  // db repositories
  private readonly chatMessageRepository: ChatMessageRepository;
  private readonly questionnaireRepository: QuestionnaireRepository;


  constructor(llmDialogManager: LlmDialogManager) {
    this.llmDialogManager = llmDialogManager;

    this.chatMessageRepository = new ChatMessageRepository();
    this.questionnaireRepository = new QuestionnaireRepository();

    // history construction policy defines the algorithm according to which the llm chat history should be constructed
    this.historyConstructionPolicy = new TwoMessageHistoryConstructionPolicy({
      messagesSplitPolicy: new MessagesSplitByHalfPolicy(),
      chatMessageRepository: this.chatMessageRepository,
      llmDialogManager: this.llmDialogManager,
    });
  }

  async converse({ lastUserMessageContent, userId, persona }: ConversationContinuationParams) {
    // retrieve data required for the system prompt
    const questionnaire = (await this.questionnaireRepository.getByUserId(userId));

    // user has not filled out the questionnaire => no LLM interaction allowed
    if (!questionnaire) {
      throw new ApplicationError(`User with id ${userId} did not fill out the questionnaire`);
    }

    // construct the history according to the set policy
    const constructedHistory = await this.historyConstructionPolicy.construct({
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
}
