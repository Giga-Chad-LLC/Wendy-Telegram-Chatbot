

export class ChatMessageDto {
  // TODO: add fields
}

export class ChatMessage {
  dto: ChatMessageDto

  constructor(dto: ChatMessageDto) {
    this.dto = dto;
  }
}