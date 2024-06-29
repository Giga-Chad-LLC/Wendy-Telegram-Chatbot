import instructions from "../../prompting/instructions.json";


// TODO: move to .ts-files all instructions & personas
export class BuildExampleConversationInstruction {
  static readonly instruction: string = instructions["buildExampleConversationInstruction"]["instruction"];
  static readonly outputFormat: string = instructions["buildExampleConversationInstruction"]["outputFormat"]
}


export class ConverseWithPartnerAccordingToPersonaInstruction {
  static readonly instruction: string = instructions["converseWithPartnerAccordingToPersonaInstruction"]["instruction"];
}

export class SummarizeMessageInstruction {
  static readonly instruction: string = instructions["summarizeMessageInstruction"]["instruction"];
  static readonly outputFormat: string = instructions["summarizeMessageInstruction"]["outputFormat"]
}