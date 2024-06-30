import { AssistantLlmChatMessage, LlmChatMessage, LlmProvider, SystemLlmChatMessage } from '../providers/LlmProvider';
import { QuestionnaireModel } from '../../../db/models/QuestionnaireModel';
import { promptTemplates } from '../prompting/PromptTemplates';
import { PromptTemplate, PromptTemplateVariables } from '../prompt/template/PromptTemplate';
import { Persona } from '../prompt/configs/Personas';
import {
  BuildExampleConversationInstruction,
  ConverseWithPartnerAccordingToPersonaInstruction, SummarizeMessageInstruction,
} from '../prompt/configs/Instructions';
import { LlmRegex } from '../../regex/llmRegex';
import { ApplicationError } from '../../errors/ApplicationError';
import { LlmChatHistory } from './LlmChatHistory';
import { ChatMessageModel } from '../../../db/models/ChatMessageModel';


export type ColdConversationParams = {
  questionnaire: QuestionnaireModel,
  persona: Persona,
}

export type GeneralConversationParams = {
  history: LlmChatHistory,
}


export type CreateGeneralDialogInstructionPromptParams = {
  questionnaire: QuestionnaireModel,
  messagesToSummarize: ChatMessageModel[],
  recentMessages: ChatMessageModel[],
  lastUserMessage: string,
  persona: Persona,
}


export class LlmDialogManager {
  private llmProvider: LlmProvider

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async startColdConversationWithFewShotPrompting({
    questionnaire,
    persona,
  }: ColdConversationParams): Promise<AssistantLlmChatMessage> {
    try {
      const conversationExample = await this.createAuxiliaryConversationExample(questionnaire, persona);
      console.log(`=============== conversationExample ===============\n${conversationExample}`)

      const initialInstructionPrompt = new PromptTemplate(promptTemplates.coldConversationStartInstructionPromptTemplate)
        .set(PromptTemplateVariables.PERSONA_DESCRIPTION, persona.description)
        .set(PromptTemplateVariables.PERSONA_NAME, persona.personaName)
        .set(PromptTemplateVariables.INSTRUCTION, ConverseWithPartnerAccordingToPersonaInstruction.instruction)
        .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
        .set(PromptTemplateVariables.CONVERSATION_EXAMPLE, conversationExample)
        .set(PromptTemplateVariables.USER_NAME, questionnaire.preferredName)
        .build();

      // contains answer of persona that should be sent in user's chat
      const llmResponseMessage = await this.llmProvider.sendMessage(initialInstructionPrompt);
      return new Promise((resolve, _) => resolve(new AssistantLlmChatMessage(llmResponseMessage)));
    }
    catch (error) {
      return new Promise((_, reject) => {
        const applicationError = new ApplicationError('Cannot request LLM for the response', error as Error);
        reject(applicationError);
      });
    }
  }

  private async createAuxiliaryConversationExample(questionnaire: QuestionnaireModel, persona: Persona): Promise<string> {
    try {
      const buildExampleConversationPrompt = new PromptTemplate(promptTemplates.buildExampleConversationPromptTemplate)
        .set(PromptTemplateVariables.PERSONA_DESCRIPTION, persona.description)
        .set(PromptTemplateVariables.INSTRUCTION, BuildExampleConversationInstruction.instruction)
        .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
        .set(PromptTemplateVariables.USER_NAME, questionnaire.preferredName)
        .set(PromptTemplateVariables.OUTPUT_FORMAT, BuildExampleConversationInstruction.outputFormat)
        .build();

      const llmResponse = await this.llmProvider.sendMessage(buildExampleConversationPrompt);

      // extract text from triple backtick block, since crafted prompt instructs LLM to insert example in backticks
      const blockInBackticksMatch = LlmRegex.tripleBackticksBlockRegex.exec(llmResponse);

      let conversationExample = '';

      // LLM fails fulfill the request
      if (blockInBackticksMatch && blockInBackticksMatch.length > 1) {
        conversationExample = blockInBackticksMatch[1].trim();
      }
      else {
        console.warn("LLM did not insert conversation example into backtick block. Cold coversation start will not contain conversation example.");
      }

      return new Promise<string>((resolve, _) => resolve(conversationExample));
    }
    catch (error) {
      return new Promise<string>((_, reject) => reject(error));
    }
  }


  // TODO: caller should update history before calling this method (write javadoc)
  // TODO: we should store last system message in database as well?
  async converse({ history }: GeneralConversationParams): Promise<AssistantLlmChatMessage> {
    this.checkTokenLimit([ history.initialSystemPrompt, ...history.messages ]);

    try {
      const llmResponseMessage = await this.llmProvider.sendMessages([
        history.initialSystemPrompt, ...history.messages,
      ]);
      return new Promise<AssistantLlmChatMessage>((resolve, _) => resolve(new AssistantLlmChatMessage(llmResponseMessage)));
    }
    catch (error) {
      return new Promise<AssistantLlmChatMessage>((_, reject) => {
        reject(new ApplicationError("Conversation attempt failed", error as Error));
      });
    }
  }


  async summarizeMessage(message: string): Promise<string> {
    try {
      const constructSummaryInstructionPrompt = new PromptTemplate(
        promptTemplates.messageSummaryCreationInstructionPromptTemplate)
        .set(PromptTemplateVariables.INSTRUCTION, SummarizeMessageInstruction.instruction)
        .set(PromptTemplateVariables.LAST_CHAT_MESSAGE, message)
        .set(PromptTemplateVariables.OUTPUT_FORMAT, SummarizeMessageInstruction.outputFormat)
        .build();

      const summary = await this.llmProvider.sendMessage(constructSummaryInstructionPrompt);
      console.log(`Message Summary:\n'''\n${summary}\n'''`);

      return new Promise<string>((resolve, _) => resolve(summary));
    }
    catch (error) {
      return new Promise((_, reject) => {
        reject(new ApplicationError(`Cannot summarize the message:\n'''${message}\n'''`, error as Error));
      });
    }
  }


  // TODO: move prompt construction variables into different class
  createGeneralDialogInstructionPrompt({
    questionnaire,
    messagesToSummarize,
    recentMessages,
    lastUserMessage,
    persona,
  }: CreateGeneralDialogInstructionPromptParams): string {
    const summarizedMessagesComponent = messagesToSummarize
      .map(msg => msg.promptifyAsSummary())
      .join('\n\n');

    const recentMessagesComponent = recentMessages
      .map(msg => msg.promptify())
      .join('\n\n');

    return new PromptTemplate(promptTemplates.generalDialogInstructionPromptTemplate)
      .set(PromptTemplateVariables.PERSONA_DESCRIPTION, persona.description)
      .set(PromptTemplateVariables.PERSONA_NAME, persona.personaName)
      .set(PromptTemplateVariables.INSTRUCTION, ConverseWithPartnerAccordingToPersonaInstruction.instruction)
      .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
      .set(PromptTemplateVariables.SUMMARIZED_MESSAGES, summarizedMessagesComponent)
      .set(PromptTemplateVariables.CONVERSATION_MESSAGES, recentMessagesComponent)
      .set(PromptTemplateVariables.LAST_CHAT_MESSAGE, lastUserMessage)
      .set(PromptTemplateVariables.USER_NAME, questionnaire.preferredName)
      .build();
  }

  private checkTokenLimit(messages: LlmChatMessage[]) {
    const limit = this.llmProvider.getTokenLimit();
    const currentTokenNumber = this.llmProvider.countMessagesTokens(messages);
    if (this.isTokenLimitExceeded(messages)) {
      throw new ApplicationError(`History has ${currentTokenNumber} tokens and exceeds token limit of ${limit}`);

    }
  }

  isTokenLimitExceeded(messages: LlmChatMessage[]): boolean {
    const limit = this.llmProvider.getTokenLimit();
    const currentTokenNumber = this.llmProvider.countMessagesTokens(messages);
    return (currentTokenNumber > limit);
  }
}
