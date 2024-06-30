import { Persona } from '../app/llm/prompt/configs/Personas';
import { ChatMessage, ChatMessageRole } from '@prisma/client';
import { AssistantLlmChatMessage, LlmChatMessage } from '../app/llm/providers/LlmProvider';

export type ColdConversationStartParams = {
  userId: number;
  persona: Persona;
};

export type ConversationContinuationParams = {
  lastUserMessageContent: string;
  userId: number;
  persona: Persona;
}

export type SaveMessageParams = {
  userId: number;
  message: string;
}

export type SaveMessageInDatabaseParams = {
  userId: number;
  message: string;
  summary: string;
  role: ChatMessageRole,
}

export abstract class AbstractLlmDialogController {
  abstract saveMessageInDatabase(params: SaveMessageInDatabaseParams): Promise<ChatMessage>;
  abstract saveUserMessage(params: SaveMessageParams): Promise<ChatMessage>;
  abstract saveAssistantMessage(params: SaveMessageParams): Promise<ChatMessage>;

  abstract summarizeMessage(message: string): Promise<string>;
  abstract converseCold(params: ColdConversationStartParams): Promise<AssistantLlmChatMessage>;
  abstract converse(params: ConversationContinuationParams): Promise<AssistantLlmChatMessage>
}

