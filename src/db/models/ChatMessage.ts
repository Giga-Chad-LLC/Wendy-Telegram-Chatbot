import { IPromptifiable } from '../../app/actions/IPromptifiable';

export enum ChatMessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export type ChatMessageDto = {
  readonly text: string;
  readonly summary: string;
  readonly role: ChatMessageRole;
  readonly sent: Date;
  readonly lastEdited: Date;
}

export type ChatMessageParams = {
  id: number;
  userId: number;
  dto: ChatMessageDto;
}

export class ChatMessage implements IPromptifiable {
  readonly id: number;
  readonly userId: number;
  readonly dto: ChatMessageDto;

  constructor({ id, userId, dto }: ChatMessageParams) {
    this.id = id;
    this.userId = userId;
    this.dto = dto;
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