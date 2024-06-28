
export enum ChatMessageRole {
  USER,
  ASSISTANT,
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

export class ChatMessage {
  readonly id: number;
  readonly userId: number;
  readonly dto: ChatMessageDto;

  constructor({ id, userId, dto }: ChatMessageParams) {
    this.id = id;
    this.userId = userId;
    this.dto = dto;
  }
}