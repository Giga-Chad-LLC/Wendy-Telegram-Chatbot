import { User } from '@prisma/client';

export type UserModelDto = {
  readonly telegramFirstName: string;
  readonly telegramLastName: string;
  readonly telegramUserId: string;
  readonly telegramChatId: number;
  readonly since: Date;
}

export class UserModel {
  readonly id: number;
  readonly dto: UserModelDto;

  constructor(user: User) {
    this.id = user.id;
    this.dto = {
      telegramFirstName: user.telegramFirstName,
      telegramLastName: user.telegramLastName,
      telegramUserId: user.telegramUserId,
      telegramChatId: user.telegramChatId,
      since: user.since,
    };
  }
}
