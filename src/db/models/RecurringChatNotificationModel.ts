

export type RecurringChatNotificationModelDto = {
  userId: number;
  dayTimepoint: number;
}

export type RecurringChatNotificationModelParams = {
  id: number;
  dto: RecurringChatNotificationModelDto;
}

export class RecurringChatNotificationModel {
  readonly id: number;
  readonly dto: RecurringChatNotificationModelDto;

  constructor({ id, dto }: RecurringChatNotificationModelParams) {
    this.id = id;
    this.dto = dto;
  }
}