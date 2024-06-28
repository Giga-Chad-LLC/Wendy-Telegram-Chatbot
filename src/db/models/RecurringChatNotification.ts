

export type RecurringChatNotificationDto = {
  userId: number;
  dayTimepoint: number;
}

export type RecurringChatNotificationParams = {
  id: number;
  dto: RecurringChatNotificationDto;
}

export class RecurringChatNotification {
  readonly id: number;
  readonly dto: RecurringChatNotificationDto;

  constructor({ id, dto }: RecurringChatNotificationParams) {
    this.id = id;
    this.dto = dto;
  }
}