import { RecurringChatNotification } from '@prisma/client';


export type RecurringChatNotificationModelDto = {
  userId: number;
  dayTimepoint: number;
}


export class RecurringChatNotificationModel {
  readonly id: number;
  readonly dto: RecurringChatNotificationModelDto;

  constructor(notification: RecurringChatNotification) {
    this.id = notification.id;
    this.dto = {
      userId: notification.userId,
      dayTimepoint: notification.dayTimepoint,
    };
  }
}