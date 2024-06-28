
export type RecurringChatNotificationParams = {
  id: number;
  userId: number;
  dayTimepoint: number;
}

export class RecurringChatNotification {
  readonly id: number;
  readonly userId: number;
  readonly dayTimepoint: number;

  constructor({ id, userId, dayTimepoint }: RecurringChatNotificationParams) {
    this.id = id;
    this.userId = userId;
    this.dayTimepoint = dayTimepoint;
  }
}