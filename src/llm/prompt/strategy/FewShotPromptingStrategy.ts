import { LlmProvider } from '../../providers/LlmProvider';
import { Questionnaire } from '../../../model/data/Questionnaire';
import { promptTemplates } from '../../../prompting/PromptTemplates';
import { PromptTemplate, PromptTemplateVariables } from '../template/PromptTemplate';
import { Wendy } from '../configs/Personas';
import {
  buildExampleConversationInstruction,
  converseWithPartnerAccordingToPersonaInstruction,
} from '../configs/Instructions';


export class FewShotPromptingStrategy {
  async prompt(llmProvider: LlmProvider, questionnaire: Questionnaire): Promise<string> {

    const buildExampleConversationPrompt = new PromptTemplate(promptTemplates.buildExampleConversationPromptTemplate)
      .set(PromptTemplateVariables.PERSONA_DESCRIPTION, Wendy.description)
      .set(PromptTemplateVariables.INSTRUCTION, buildExampleConversationInstruction.instruction)
      .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
      .set(PromptTemplateVariables.OUTPUT_FORMAT, "Print the result in a SINGLE ```-backtick block.")
      .set(PromptTemplateVariables.USER_NAME, questionnaire.dto.preferredName)
      .build();

    const response1 = await llmProvider.sendMessage(buildExampleConversationPrompt)

    const regex = /```([\s\S]*?)```/;
    const match = regex.exec(response1);

    if (!(match && match.length > 1)) {
      throw Error("No backtick block");
    }

    const conversationExample = match[1].trim();

    console.log(`=============== response1 ===============\n${response1}`)
    console.log(`=============== conversationExample ===============\n${conversationExample}`)

    const secondPrompt = new PromptTemplate(promptTemplates.coldConversationStartInstructionPromptTemplate)
      .set(PromptTemplateVariables.PERSONA_DESCRIPTION, Wendy.description)
      .set(PromptTemplateVariables.PERSONA_NAME, Wendy.personaName)
      .set(PromptTemplateVariables.INSTRUCTION, converseWithPartnerAccordingToPersonaInstruction.instruction)
      .set(PromptTemplateVariables.QUESTIONNAIRE, questionnaire.promptify())
      .set(PromptTemplateVariables.CONVERSATION_EXAMPLE, conversationExample)
      .set(PromptTemplateVariables.USER_NAME, questionnaire.dto.preferredName)
      .set(PromptTemplateVariables.CHAT_MESSAGE, "Hello! Today I had a great day. I played football with my friends and hit 3 goals! Our team won over 2 goals!")
      .build();

    const response2 = await llmProvider.sendMessage(secondPrompt);

    return new Promise((resolve, reject) => {
      resolve(response2)
    });
  }
}

