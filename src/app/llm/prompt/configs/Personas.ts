import personas from "../../../prompting/personas.json";


export class Persona {
  public readonly personaName: string
  public readonly description: string

  protected constructor(personaName: string, description: string) {
    this.personaName = personaName;
    this.description = description;
  }
}

export class Wendy extends Persona {
  constructor() {
    const personaName: string = personas["Wendy"]["name"];
    const description: string = personas["Wendy"]["description"];
    super(personaName, description);
  }
}
