import { OpenAI } from 'openai';
import { ChatMessage, LlmProvider, LlmProviderParams, Role } from './LlmProvider';




export class OpenAILlmProvider implements LlmProvider {
  private openai: OpenAI
  private readonly model: string

  constructor({ token, model }: LlmProviderParams) {
    this.openai = new OpenAI({
      apiKey: token,
    });
    this.model = model
  }

  async sendMessage(message: string): Promise<string> {
    return this.sendMessages([{
      role: Role.USER,
      content: message
    }]);
  }

  async sendMessages(messages: ChatMessage[]): Promise<string> {
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      stream: true,
    });

    let response: string = "";

    for await (const chunk of stream) {
      response += chunk.choices[0]?.delta?.content || "";
    }

    // TODO: when error?
    return new Promise<string>((resolve, reject) => {
      resolve(response)
    });
  }
}
