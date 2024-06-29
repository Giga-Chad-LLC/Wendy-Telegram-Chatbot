import { IPromptifiable } from '../../app/actions/IPromptifiable';
import { ChatMessage, ChatMessageRole } from '@prisma/client';

export enum ChatMessageModelRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export type ChatMessageModelDto = {
  readonly text: string;
  readonly summary: string;
  readonly role: ChatMessageModelRole;
  readonly sent: Date;
  readonly lastEdited: Date;
}

export class ChatMessageModel implements IPromptifiable {
  readonly id: number;
  readonly userId: number;
  readonly dto: ChatMessageModelDto;

  constructor(chatMessage: ChatMessage) {
    this.id = chatMessage.id;
    this.userId = chatMessage.userId;

    const role = (chatMessage.role == ChatMessageRole.USER)
        ? ChatMessageModelRole.USER : ChatMessageModelRole.ASSISTANT;

    this.dto = {
      text: chatMessage.text,
      summary: chatMessage.summary,
      role: role,
      sent: chatMessage.sent,
      lastEdited: chatMessage.lastEdited,
    }
  }

  promptify(): string {
    const role = this.dto.role as string;
    // TODO: potentially slow due to `toLocaleString`
    return `[Sent on]: ${this.dto.sent.toLocaleString()}
[Sent by]: ${role}
[Message]: ${this.dto.text}`;
  }

  promptifyAsSummary(): string {
    const role = this.dto.role as string;
    // TODO: potentially slow due to `toLocaleString`
    return `Summarized version of the message:
[Sent on]: ${this.dto.sent.toLocaleString()}
[Sent by]: ${role}
[Summary]: ${this.dto.summary}`;
  }
}