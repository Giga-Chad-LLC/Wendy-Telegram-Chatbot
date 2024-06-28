import { LlmProvider } from '../../providers/LlmProvider';
import { Questionnaire } from '../../../model/data/Questionnaire';
import { promptTemplates } from '../../../prompting/PromptTemplates';


const template = promptTemplates.buildExampleConversationPrompt

const secondTemplate = promptTemplates.coldConversationStartInstructionPrompt


export class FewShotPromptingStrategy {
  async prompt(llmProvider: LlmProvider, questionnaire: Questionnaire): Promise<string> {
    const craftedPrompt = template
      .replace("{{Persona}}", "")
      .replace("{{Task}}", ``)
      .replace("{{Questionnaire}}", questionnaire.promptify())
      .replace("{{OutputFormat}}", "Print the result in a SINGLE ```-backtick block.")
      .replace("{{Name}}", questionnaire.dto.preferredName)

    const response1 = await llmProvider.sendMessage(craftedPrompt)

    const regex = /```([\s\S]*?)```/;
    const match = regex.exec(response1);

    if (!(match && match.length > 1)) {
      throw Error("No backtick block");
    }

    const conversationExample = match[1].trim();

    console.log(`=============== response1 ===============\n${response1}`)
    console.log(`=============== conversationExample ===============\n${conversationExample}`)

    const secondPrompt = secondTemplate
      .replace("{{Persona}}", "Persona of helpful and loving online female pal named Wendy that helps her peer who may have a mental health issues and may currently be in pain or struggle.")
      .replace("{{Task}}", ``)
      .replace("{{Questionnaire}}", questionnaire.promptify())
      .replace("{{ConversationExample}}", conversationExample)
      .replace("{{Name}}", questionnaire.dto.preferredName);

    const response2 = await llmProvider.sendMessage(secondPrompt);

    return new Promise((resolve, reject) => {
      resolve(response2)
    });
  }
}

