import { LlmChatMessage, SystemLlmChatMessage } from '../providers/LlmProvider';



export type LlmChatHistoryParams = {
  readonly messages: LlmChatMessage[];
  readonly initialSystemPrompt: SystemLlmChatMessage;
  readonly lastMessage: LlmChatMessage;
}


export class LlmChatHistory {
  readonly messages: LlmChatMessage[];
  readonly initialSystemPrompt: SystemLlmChatMessage;
  readonly lastMessage: LlmChatMessage; // TODO: getter?

  /**
   * @param messages messages <b>must NOT</b> contain the initial system prompt, use `initialSystemPrompt` to store it.
   * @param initialSystemPrompt initial system prompt sent to LLM at the beginning of the conversation.
   * @param lastMessage last message (either user's or assistant's) sent in a LLM chat, it MUST be inserted into `messages` as well.
   */
  constructor({ messages, initialSystemPrompt, lastMessage }: LlmChatHistoryParams) {
    this.messages = messages;
    this.initialSystemPrompt = initialSystemPrompt;
    this.lastMessage = lastMessage;
  }
}