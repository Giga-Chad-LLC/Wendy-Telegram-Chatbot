import { IPromptifiable } from '../../app/actions/IPromptifiable';

export type QuestionnaireModelDto = {
  readonly preferredName: string;
  readonly isAdult: boolean;
  readonly age: number | null;
  readonly residenceCountry: string;
  readonly residenceCity: string | null;
  readonly bio: string;
}

export type QuestionnaireModelParams = {
  id: number;
  userId: number;
  dto: QuestionnaireModelDto;
}

export class QuestionnaireModel implements IPromptifiable {
  readonly id: number;
  readonly userId: number;
  dto: QuestionnaireModelDto;

  constructor({ id, userId, dto }: QuestionnaireModelParams) {
    this.id = id;
    this.userId = userId;
    this.dto = dto;
  }

  /**
   * Creates a string summary of the `Questionnaire` suitable to be inserted into the prompt.
   *
   * @return formatted string representation of the questionnaire
   */
  promptify(): string {
    return `Preferred Name: ${this.dto.preferredName}
      Maturity: ${this.dto.isAdult ? 'Adult' : 'Minor'}
      ${this.dto.age ? `Age: ${this.dto.age}` : ''}
      Country of residence: ${this.dto.residenceCountry}
      ${this.dto.residenceCity ? `City of residence: ${this.dto.residenceCity}` : ''}
      Bio sent by ${this.dto.preferredName} when you first met:
      "${this.dto.bio}"`
  }
}