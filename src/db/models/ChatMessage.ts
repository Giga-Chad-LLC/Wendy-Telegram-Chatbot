
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

export class ChatMessage {
  readonly id: number;
  readonly userId: number;
  readonly dto: ChatMessageDto;

  constructor(id: number, userId: number, dto: ChatMessageDto) {
    this.id = id;
    this.userId = userId;
    this.dto = dto;
  }
}