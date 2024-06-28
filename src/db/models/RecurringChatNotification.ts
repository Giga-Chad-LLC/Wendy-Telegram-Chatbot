
export class RecurringChatNotification {
  readonly id: number;
  readonly userId: number;
  readonly dayTimepoint: number;

  constructor(id: number, userId: number, dayTimepoint: number) {
    this.id = id;
    this.userId = userId;
    this.dayTimepoint = dayTimepoint;
  }
}