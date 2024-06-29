import { LlmProvider } from '../providers/LlmProvider';
import { Questionnaire } from '../../../db/models/Questionnaire';
import { promptTemplates } from '../../prompting/PromptTemplates';
import { PromptTemplate, PromptTemplateVariables } from '../prompt/template/PromptTemplate';
import { Persona, Wendy } from '../prompt/configs/Personas';
import {
  buildExampleConversationInstruction,
  converseWithPartnerAccordingToPersonaInstruction,
} from '../prompt/configs/Instructions';
import { LlmRegex } from '../../regex/llmRegex';
import { ChatMessage } from '../../../db/models/ChatMessage';


export type ColdConversationParams = {
  lastUserChatMessage: string,
  questionnaire: Questionnaire,
  persona: Persona,
}

// export type GeneralConversationParams = {
//   lastUserChatMessage: string,
//   questionnaire: Questionnaire,
//   persona: Persona,
//   lastMessages: string[]
// }

export class LlmDialog {
  private llmProvider: LlmProvider

  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async startColdConversationWithFewShotPrompting({
    lastUserChatMessage,
    questionnaire,
    persona,
  }: ColdConversationParams): Promise<string> {
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
        .set(PromptTemplateVariables.CHAT_MESSAGE, lastUserChatMessage)
        .build();

      // contains answer of persona that should be sent in user's chat
      const personaLlmResponse = await this.llmProvider.sendMessage(initialInstructionPrompt);
      return new Promise((resolve, _) => resolve(personaLlmResponse));
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

  // async converse() {
  //
  // }
}

