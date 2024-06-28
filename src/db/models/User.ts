
export type UserDto = {
  readonly telegramFirstName: string;
  readonly telegramLastName: string;
  readonly telegramUserId: string;
  readonly telegramChatId: number;
  readonly since: Date;
}

export type UserParams = {
  id: number;
  dto: UserDto;
}

export class User {
  readonly id: number;
  readonly dto: UserDto;

  constructor({ id, dto }: UserParams) {
    this.id = id;
    this.dto = dto;
  }
}
