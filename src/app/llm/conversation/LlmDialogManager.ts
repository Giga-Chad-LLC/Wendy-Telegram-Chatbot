import { AssistantLlmChatMessage, LlmProvider, SystemLlmChatMessage } from '../providers/LlmProvider';
import { Questionnaire } from '../../../db/models/Questionnaire';
import { promptTemplates } from '../../prompting/PromptTemplates';
import { PromptTemplate, PromptTemplateVariables } from '../prompt/template/PromptTemplate';
import { Persona } from '../prompt/configs/Personas';
import {
  buildExampleConversationInstruction,
  converseWithPartnerAccordingToPersonaInstruction,
} from '../prompt/configs/Instructions';
import { LlmRegex } from '../../regex/llmRegex';
import { ApplicationError } from '../../errors/ApplicationError';
import { LlmChatHistory } from './LlmChatHistory';
import { ChatMessageModel } from '../../../db/models/ChatMessageModel';


export type ColdConversationParams = {
  questionnaire: Questionnaire,
  persona: Persona,
}

export type GeneralConversationParams = {
  history: LlmChatHistory,
}


export type CreateGeneralDialogInstructionPromptParams = {
  questionnaire: Questionnaire,
  messagesToSummarize: ChatMessageModel[],
  recentMessages: ChatMessageModel[],
  lastUserMessage: ChatMessageModel,
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
  }: ColdConversationParams): Promise<LlmChatHistory> {
    try {
      const conversationExample = await this.createAuxiliaryConversationExample(questionnaire, persona);
      console.log(`=============== conversationExample ===============\n${conversationExample}`)

      const initialInstructionPrompt = new PromptTemplate(promptTemplates.coldConversationStartInstructionPromptTemplate)
        .set(PromptTemplateVariables.PERSONA_DESCRIPTION, persona.description)
        .set(PromptTemplateVariables.PERSONA_NAME, persona.personaName)
        .set(PromptTemplateVariables.INSTRUCTION, converseWithPartnerAccordingToPersonaInstruction.instruction)
        .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
        .set(PromptTemplateVariables.CONVERSATION_EXAMPLE, conversationExample)
        .set(PromptTemplateVariables.USER_NAME, questionnaire.dto.preferredName)
        .build();

      // contains answer of persona that should be sent in user's chat
      const llmResponseMessage = await this.llmProvider.sendMessage(initialInstructionPrompt);
      const assistantMessage = new AssistantLlmChatMessage(llmResponseMessage);

      return new Promise((resolve, _) => {
        const history = new LlmChatHistory({
          messages: [ assistantMessage ],
          initialSystemPrompt: new SystemLlmChatMessage(initialInstructionPrompt),
          lastMessage: assistantMessage,
        });

        resolve(history);
      });
    }
    catch (error) {
      return new Promise((_, reject) => reject(error));
    }
  }


  private async createAuxiliaryConversationExample(questionnaire: Questionnaire, persona: Persona): Promise<string> {
    try {
      const buildExampleConversationPrompt = new PromptTemplate(promptTemplates.buildExampleConversationPromptTemplate)
        .set(PromptTemplateVariables.PERSONA_DESCRIPTION, persona.description)
        .set(PromptTemplateVariables.INSTRUCTION, buildExampleConversationInstruction.instruction)
        .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
        .set(PromptTemplateVariables.USER_NAME, questionnaire.dto.preferredName)
        .set(PromptTemplateVariables.OUTPUT_FORMAT, buildExampleConversationInstruction.outputFormat)
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


  // TODO: caller should update history before calling this method
  // TODO: we should store last system message in database as well!
  async converse({ history }: GeneralConversationParams): Promise<LlmChatHistory> {
    this.checkHistoryTokenLimit(history);

    try {
      const llmResponse = await this.llmProvider.sendMessages(history.messages);
      const assistantMessage = new AssistantLlmChatMessage(llmResponse);

      const updatedHistory = new LlmChatHistory({
        messages: [...history.messages, assistantMessage],
        initialSystemPrompt: history.initialSystemPrompt,
        lastMessage: assistantMessage,
      });

      return new Promise((resolve, _) => resolve(updatedHistory));
    }
    catch (error) {
      return new Promise((_, reject) => {
        reject(new ApplicationError("Conversation attempt failed", error as Error));
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
      .set(PromptTemplateVariables.INSTRUCTION, converseWithPartnerAccordingToPersonaInstruction.instruction)
      .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
      .set(PromptTemplateVariables.SUMMARIZED_MESSAGES, summarizedMessagesComponent)
      .set(PromptTemplateVariables.CONVERSATION_MESSAGES, recentMessagesComponent)
      .set(PromptTemplateVariables.LAST_CHAT_MESSAGE, lastUserMessage.dto.text)
      .set(PromptTemplateVariables.USER_NAME, questionnaire.dto.preferredName)
      .build();
  }


  private checkHistoryTokenLimit(history: LlmChatHistory) {
    const limit = this.llmProvider.getTokenLimit();
    const currentTokenNumber = this.llmProvider.countMessagesTokens(history.messages);
    if (this.isTokenLimitExceeded(history)) {
      throw new ApplicationError(`History has ${currentTokenNumber} tokens and exceeds token limit of ${limit}`);

    }
  }


  isTokenLimitExceeded(history: LlmChatHistory): boolean {
    const limit = this.llmProvider.getTokenLimit();
    const currentTokenNumber = this.llmProvider.countMessagesTokens(history.messages);
    return (currentTokenNumber > limit);
  }
}
