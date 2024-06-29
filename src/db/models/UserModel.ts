
export type UserModelDto = {
  readonly telegramFirstName: string;
  readonly telegramLastName: string;
  readonly telegramUserId: string;
  readonly telegramChatId: number;
  readonly since: Date;
}

export type UserModelParams = {
  id: number;
  dto: UserModelDto;
}

export class UserModel {
  readonly id: number;
  readonly dto: UserModelDto;

  constructor({ id, dto }: UserModelParams) {
    this.id = id;
    this.dto = dto;
  }
}
