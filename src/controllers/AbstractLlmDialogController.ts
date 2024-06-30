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

export type SaveMessageWithRoleParams = {
  userId: number;
  message: string;
  role: ChatMessageRole,
}

export abstract class AbstractLlmDialogController {
  abstract saveMessage({ userId, message, role }: SaveMessageWithRoleParams): Promise<ChatMessage>;
  abstract saveUserMessage({ userId, message }: SaveMessageParams): Promise<ChatMessage>;
  abstract saveAssistantMessage({ userId, message }: SaveMessageParams): Promise<ChatMessage>;

  abstract summarizeMessage(message: string): Promise<string>;
  abstract converseCold({ userId, persona }: ColdConversationStartParams): Promise<AssistantLlmChatMessage>;
  abstract converse({ lastUserMessageContent, userId, persona }: ConversationContinuationParams): Promise<AssistantLlmChatMessage>
}

