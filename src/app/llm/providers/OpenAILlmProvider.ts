import { OpenAI } from 'openai';
import { LlmProvider, LlmProviderParams, LlmChatMessageRole, LlmChatMessage } from './LlmProvider';




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
      role: LlmChatMessageRole.USER,
      content: message
    }]);
  }

  async sendMessages(messages: LlmChatMessage[]): Promise<string> {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        stream: true,
      });

      let response: string = "";

      for await (const chunk of stream) {
        response += chunk.choices[0]?.delta?.content || "";
      }

      return new Promise<string>((resolve, _) => resolve(response));
    }
    catch (error) {
      return new Promise<string>((_, reject) => reject(error));
    }
  }
}
