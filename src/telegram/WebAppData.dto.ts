type Event = 'FIRST_QUESTIONNAIRE_CREATE' | 'NOTIFICATION_CHANGE';

export interface WebAppDataDto {
  event: Event;
  content: any;
}
