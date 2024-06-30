import { ChatMessage, ChatMessageRole } from '@prisma/client';
import { ChatMessageRepository } from '../db/repositories/ChatMessageRepository';
import { LlmDialogManager } from '../app/llm/conversation/LlmDialogManager';
import {
  AssistantLlmChatMessage,
  LlmChatMessageRole,
  SystemLlmChatMessage,
  UserLlmChatMessage,
} from '../app/llm/providers/LlmProvider';
import { QuestionnaireRepository } from '../db/repositories/QuestionnaireRepository';
import { QuestionnaireModel } from '../db/models/QuestionnaireModel';
import { Persona } from '../app/llm/prompt/configs/Personas';
import { ApplicationError } from '../app/errors/ApplicationError';
import { MessagesSplitByHalfPolicy } from '../app/llm/conversation/policies/MessagesSplitPolicies';
import {
  IHistoryConstructionPolicy,
  TwoMessageHistoryConstructionPolicy,
} from '../app/llm/conversation/policies/IHistoryConstructionPolicies';
import {
  ColdConversationStartParams,
  ConversationContinuationParams,
  AbstractLlmDialogController, SaveMessageParams, SaveMessageWithRoleParams,
} from './AbstractLlmDialogController';


/**
 * Acts as a facade over LLM and database related operations.
 * <\br>
 * User this class to effectively conduct communication with an LLM and store its responses into the database.
 */
export class LlmDialogController extends AbstractLlmDialogController {
  private readonly llmDialogManager: LlmDialogManager;
  private readonly historyConstructionPolicy: IHistoryConstructionPolicy;

  // db repositories
  private readonly chatMessageRepository: ChatMessageRepository;
  private readonly questionnaireRepository: QuestionnaireRepository;


  constructor(llmDialogManager: LlmDialogManager) {
    super();
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


  async saveMessage({ userId, message, role }: SaveMessageWithRoleParams): Promise<ChatMessage> {
    const now = new Date();
    const summary = await this.summarizeMessage(message);

    return await this.chatMessageRepository.create({
      userId,
      text: message,
      summary: summary,
      role,
      sent: now,
      lastEdited: now,
    });
  }

  async saveUserMessage({ userId, message }: SaveMessageParams): Promise<ChatMessage> {
    return await this.saveMessage({ userId, message, role: ChatMessageRole.USER });
    /*const now = new Date();
    const summary = await this.summarizeMessage(message);

    return await this.chatMessageRepository.create({
      userId,
      text: message,
      summary: summary,
      role: ChatMessageRole.USER,
      sent: now,
      lastEdited: now,
    });*/
  }

  async saveAssistantMessage({ userId, message }: SaveMessageParams): Promise<ChatMessage> {
    return await this.saveMessage({ userId, message, role: ChatMessageRole.ASSISTANT });
  }

  /**
   * Prompts LLM to create a summary of a message (time-consuming operation).
   * Can be decorated to apply encryption.
   */
  async summarizeMessage(message: string): Promise<string> {
    return await this.llmDialogManager.summarizeMessage(message);
  }

  /**
   * This method <b>MUST</b> be called only once right after the user have filled out the questionnaire.
   * It prompts the LLM to create a first message in the conversation with a user,
   * and then stores in the database. This message is then intended to be sent as the first message in the chat.
   * <br/>
   * Initiates the "cold" start of a conversation between a user associated with the `userId` and an LLM.
   * <br/>
   * <em>"Cold"</em> means that there is no other messages in the chat history present, and we have very little info
   * about the user, namely only their questionnaire.
   *
   * @param userId id of a user with whom to initiate a conversation, used to extract user's questionnaire.
   * @param persona instance of `Persona` that instructs how LLM should respond.
   */
  async converseCold({ userId, persona }: ColdConversationStartParams): Promise<AssistantLlmChatMessage> {
    // retrieve data required for the system prompt
    const questionnaire = (await this.questionnaireRepository.getByUserId(userId));

    // user has not filled out the questionnaire => no LLM interaction allowed
    if (!questionnaire) {
      throw new ApplicationError(`User with id ${userId} did not fill out the questionnaire`);
    }

    const assistantLlmChatMessage = await this.llmDialogManager
      .startColdConversationWithFewShotPrompting({
        questionnaire: new QuestionnaireModel(questionnaire),
        persona,
      });

    // save assistant message in the database
    await this.saveAssistantMessage({ userId, message: assistantLlmChatMessage.content });
    /*
    const messageSummary = await this.summarizeMessage(assistantLlmChatMessage.content);
    const datePoint = new Date();

    await this.chatMessageRepository.create({
      userId,
      text: assistantLlmChatMessage.content,
      summary: messageSummary,
      role: ChatMessageRole.ASSISTANT,
      sent: datePoint,
      lastEdited: datePoint,
    });*/

    return new Promise<AssistantLlmChatMessage>((resolve, _) => resolve(assistantLlmChatMessage));
  }


  /**
   * Collects the LLM chat history from the previous messages between LLM and user stored in the database,
   * and prompts the LLM to create a response to the last user message. Next, the LLM response is saved in the database.
   * <\br>
   * Use this method <b>ONLY</b> if user and LLM already have some chat history, otherwise use `converseCold`.
   *
   * @param lastUserMessageContent last message sent by the user.
   * @param userId id of the user with whom we have a conversation.
   * @param persona instance of `Persona` that instructs how LLM should respond.
   */
  async converse({ lastUserMessageContent, userId, persona }: ConversationContinuationParams): Promise<AssistantLlmChatMessage> {
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

    // console.log(`History Crafted: messages count: ${constructedHistory.messages.length}`)
    // console.log(`History's Initial System Prompt:\n"""${constructedHistory.initialSystemPrompt.content}\n"""`)
    // console.log(`User's Last Message:\n"""${constructedHistory.lastMessage.content}\n"""`)
    console.log(`
================ Crafted History ================
${constructedHistory.promptify()}
=================================================
    `.trim())

    // use current history to make conversation prompts
    const assistantLlmChatMessage = await this.llmDialogManager
      .converse({ history: constructedHistory });

    // save assistant message in DB
    await this.saveAssistantMessage({ userId, message: assistantLlmChatMessage.content });
    /*const messageSummary = await this.summarizeMessage(assistantLlmChatMessage.content);
    const datePoint = new Date();

    // console.log(`LLM Response Message: "${assistantLlmChatMessage.content}"`);
    // console.log(`LLM Response Message (summarized): "${messageSummary}"`);

    await this.chatMessageRepository.create({
      userId,
      text: assistantLlmChatMessage.content,
      summary: messageSummary,
      role: ChatMessageRole.ASSISTANT,
      sent: datePoint,
      lastEdited: datePoint,
    });*/

    return new Promise<AssistantLlmChatMessage>((resolve, _) => resolve(assistantLlmChatMessage));
  }
}
