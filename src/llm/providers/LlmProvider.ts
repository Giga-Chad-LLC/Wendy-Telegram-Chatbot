
export interface LlmProviderParams {
  token: string;
  model: string;
}

export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
}

export type ChatMessage = {
  role: Role,
  content: string
}

export interface LlmProvider {
  sendMessage(message: string): Promise<string>;
  sendMessages(messages: ChatMessage[]): Promise<string>;
}

