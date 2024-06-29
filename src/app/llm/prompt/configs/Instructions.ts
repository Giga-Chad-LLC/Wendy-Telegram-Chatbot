import instructions from "../../prompting/instructions.json";


export class buildExampleConversationInstruction {
  static readonly instruction: string = instructions["buildExampleConversationInstruction"]["instruction"];
  static readonly outputFormat: string = instructions["buildExampleConversationInstruction"]["outputFormat"]
}


export class converseWithPartnerAccordingToPersonaInstruction {
  static readonly instruction: string = instructions["converseWithPartnerAccordingToPersonaInstruction"]["instruction"];
}