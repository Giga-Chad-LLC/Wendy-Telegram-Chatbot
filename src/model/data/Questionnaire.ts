

export type QuestionnaireDto = {
  readonly preferredName: string;
  readonly isAdult: boolean;
  readonly age?: number;
  readonly residenceCountry: string;
  readonly residenceCity?: string;
  readonly bio: string;
}


export class Questionnaire {
  dto: QuestionnaireDto

  constructor(dto: QuestionnaireDto) {
    this.dto = dto;
  }

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