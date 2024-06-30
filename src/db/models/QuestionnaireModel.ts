import { IPromptifiable } from '../../app/actions/IPromptifiable';
import { Questionnaire } from '@prisma/client';


export class QuestionnaireModel implements IPromptifiable {
  readonly userId: number;
  readonly preferredName: string;
  readonly isAdult: boolean;
  /**
   * User's birthday date
   */
  readonly bday: Date;
  readonly residenceCountry: string;
  readonly bio: string;

  constructor(questionnaire: Questionnaire) {
    this.userId = questionnaire.userId;
    this.preferredName = questionnaire.preferredName;
    this.isAdult = questionnaire.isAdult;
    this.bday = questionnaire.bday;
    this.residenceCountry = questionnaire.residenceCountry;
    this.bio = questionnaire.bio;
  }

  /**
   * Creates a string summary of the `Questionnaire` suitable to be inserted into the prompt.
   *
   * @return formatted string representation of the questionnaire
   */
  promptify(): string {
    const age = this.getAge();

    return `Preferred Name: ${this.preferredName}
Maturity: ${this.isAdult ? 'Adult' : 'Minor'}
${age ? `Age: ${age}` : ''}
Country of residence: ${this.residenceCountry}
Bio sent by ${this.preferredName} when you first met:
"${this.bio}"`
  }

  private getAge(): number | null {
    const diff = Date.now() - this.bday.getTime();
    if (diff < 0) {
      return null;
    }
    else {
      return new Date(diff).getUTCFullYear() - 1970;
    }
  }
}