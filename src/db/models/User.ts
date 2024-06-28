
export type UserDto = {
  readonly telegramFirstName: string;
  readonly telegramLastName: string;
  readonly telegramUserId: string;
  readonly telegramChatId: number;
  readonly since: Date;
}

export class User {
  readonly id: number;
  readonly dto: UserDto;

  constructor(id: number, dto: UserDto) {
    this.id = id;
    this.dto = dto;
  }
}
