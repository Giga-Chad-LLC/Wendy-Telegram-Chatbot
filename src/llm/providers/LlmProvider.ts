
export interface LlmProviderParams {
  token: string;
  model: string;
}

export enum LlmChatMessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export type LlmChatMessage = {
  role: LlmChatMessageRole,
  content: string
}

export interface LlmProvider {
  sendMessage(message: string): Promise<string>;
  sendMessages(messages: LlmChatMessage[]): Promise<string>;
}

