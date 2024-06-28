import OpenAI from 'openai';

import { LlmProvider, LlmProviderParams } from './LlmProvider';




export class OpenAILlmProvider implements LlmProvider {
  private openai: OpenAI
  private readonly model: string

  constructor({ token, model }: LlmProviderParams) {
    this.openai = new OpenAI({
      apiKey: token,
    });
    this.model = model
  }

  async sendMessage(msg: string): Promise<string> {
    const stream = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: msg }],
      stream: true,
    });

    let message: string = "";

    for await (const chunk of stream) {
      message += chunk.choices[0]?.delta?.content || "";
    }

    return new Promise<string>((resolve, reject) => {
      resolve(message)
    })
  }
}
