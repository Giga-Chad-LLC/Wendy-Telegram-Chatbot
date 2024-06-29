import { IPromptifiable } from '../../app/actions/IPromptifiable';
import { Questionnaire } from '@prisma/client';

export type QuestionnaireModelDto = {
  readonly userId: number;
  readonly preferredName: string;
  readonly isAdult: boolean;
  readonly age: number | null;
  readonly residenceCountry: string;
  readonly residenceCity: string | null;
  readonly bio: string;
}


export class QuestionnaireModel implements IPromptifiable {
  readonly id: number;
  dto: QuestionnaireModelDto;

  constructor(questionnaire: Questionnaire) {
    this.id = questionnaire.id;
    this.dto = {
      userId: questionnaire.userId,
      preferredName: questionnaire.preferredName,
      isAdult: questionnaire.isAdult,
      age: questionnaire.age,
      residenceCountry: questionnaire.residenceCountry,
      residenceCity: questionnaire.residenceCity,
      bio: questionnaire.bio,
    };
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