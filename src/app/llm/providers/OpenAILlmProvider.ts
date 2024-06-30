import { OpenAI } from 'openai';
import * as tiktoken from 'tiktoken';
import { TiktokenModel } from 'tiktoken';
import { LlmChatMessage, LlmChatMessageRole, LlmProvider, LlmProviderParams } from './LlmProvider';
import { ApplicationError } from '../../errors/ApplicationError';


export class OpenAILlmProvider implements LlmProvider {
  private openai: OpenAI
  private readonly model: string

  constructor({ token, model }: LlmProviderParams) {
    this.openai = new OpenAI({
      apiKey: token,
    });
    this.model = model
  }

  // TODO: dynamically identify token limits based on model
  getTokenLimit(): number {
    return 64_000;
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

  countTextTokens(text: string): number {
    let enc: tiktoken.Tiktoken | null = null;
    try {
      enc = tiktoken.encoding_for_model(this.model as TiktokenModel);
      return enc!.encode(text).length;
    }
    catch (error) {
      console.error(error);
      throw new ApplicationError("Cannot encode text and count tokens number", error as Error);
    }
    finally {
      if (enc) {
        enc.free();
      }
    }
  }

  countMessagesTokens(messages: LlmChatMessage[]): number {
    let enc: tiktoken.Tiktoken | null = null;
    try {
      enc = tiktoken.encoding_for_model(this.model as TiktokenModel);
      return messages
        .map(msg => enc!.encode(msg.content).length)
        .reduce((acc, value) => acc + value, 0);
    }
    catch (error) {
      console.error(error);
      throw new ApplicationError("Cannot encode message and count tokens number", error as Error);
    }
    finally {
      if (enc) {
        enc.free();
      }
    }
  }
}
