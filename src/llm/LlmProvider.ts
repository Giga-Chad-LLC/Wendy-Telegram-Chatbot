
export interface LlmProviderParams {
  token: string;
  model: string;
}

export interface LlmProvider {
  sendMessage(msg: string): Promise<string>;
}

