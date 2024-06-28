
export const promptTemplates = {
  buildExampleConversationPrompt: `
### Your Persona:
{{Persona}}


### Instruction:
{{Instruction}}

### About conversation partner: 
You are talking with a person named {{UserName}}. Here is her summary:
{{Questionnaire}}

### Output Format:
{{OutputFormat}}`,

  coldConversationStartInstructionPrompt: `
### Your Persona:
{{Persona}}


### Instruction:
{{Instruction}}


### About conversation partner: 
You are talking with a person named {{Name}}. Here is her summary:
{{Questionnaire}}


### Example:
Here is an example of possible conversation between Wendy and {{Name}}. Use it ONLY as an example of how you should behave:
{{ConversationExample}}


### Last message of {{UserName}}:
{{ChatMessage}}


From now on, you respond ONLY with character's persona messages.`,

  dialogInitializationInstructionPrompt: `
### Your Persona:
{{Persona}}
${1/* TODO: finalize prompt! */}
`
};