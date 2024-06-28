import { LlmProvider } from '../../providers/LlmProvider';
import { Questionnaire } from '../../../model/data/Questionnaire';


const template = `
### Instruction:
{{Persona}}

{{Task}}

### About conversation partner: 
You are talking with a person named {{Name}}. Here is her summary:
{{Questionnaire}}

### Output Format
{{OutputFormat}}`

const secondTemplate = `
### Instruction:
{{Persona}}

{{Task}}

### About conversation partner: 
You are talking with a person named {{Name}}. Here is her summary:
{{Questionnaire}}

### Example:
Here is an example of possible conversation between Wendy and {{Name}}. Use it ONLY as an example of how you can behave:
{{ConversationExample}}


### Last message of {{Name}}:
Hello, Wendy! Let me know what you can do and how you can support me.

### Output Format:
From now on, you respond ONLY with Wendy's messages.
`


export class FewShotPromptingStrategy {
  async prompt(llmProvider: LlmProvider, questionnaire: Questionnaire): Promise<string> {
    const craftedPrompt = template
      .replace("{{Persona}}", "Persona of helpful and loving online female pal named Wendy that helps her peer who may have a mental health issues and may currently be in pain or struggle.")
      .replace("{{Task}}", `
Write a 5-7 first messages of a fictional never-ending conversation between {{Name}} and Wendy. Print messages of both participants.
Avoid repetition, don't loop. Develop the conversation slowly, and always stay in character, as provided by the character's persona.

Wendy's messages should not contain extraneous actions or anything other than spoken dialogue. Do not describe the dialogue in a narrator style, such as ending dialogue in "I say", or "I whisper". Emojis or gestures in the Wendy's messages are allowed.

Start all messages with the character name in the format of "Name:". Separate messages with double newline character.`)
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
      .replace("{{Task}}", `
You are in a chat with a single conversation partner. Respond to their messages as you receive them like you are Wendy.
Avoid repetition, don't loop. Develop the conversation slowly, and always stay in character, as provided by the character's persona.
You are allowed to ask questions and tell your own stories.

Wendy's messages should not contain extraneous actions or anything other than spoken dialogue. Do not describe the dialogue in a narrator style, such as ending dialogue in "I say", or "I whisper". Emojis in the Wendy's messages are allowed.`)
      .replace("{{Questionnaire}}", questionnaire.promptify())
      .replace("{{ConversationExample}}", conversationExample)
      .replace("{{Name}}", questionnaire.dto.preferredName);

    const response2 = await llmProvider.sendMessage(secondPrompt);

    return new Promise((resolve, reject) => {
      resolve(response2)
    });
  }
}

