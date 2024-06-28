
export const promptTemplates = {
  buildExampleConversationPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}


### Instruction:
{{INSTRUCTION}}

### About conversation partner: 
You are talking with a person named {{USER_NAME}}. Here is her summary:
{{QUESTIONNAIRE}}

### Output Format:
{{OUTPUT_FORMAT}}`,

  coldConversationStartInstructionPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}


### Instruction:
{{INSTRUCTION}}


### About conversation partner: 
You are talking with a person named {{USER_NAME}}. Here is her summary:
{{QUESTIONNAIRE}}


### Example:
Here is an example of possible conversation between {{PERSONA_NAME}} and {{USER_NAME}}. Use it ONLY as an example of how you should behave:
{{CONVERSATION_EXAMPLE}}


### Last message of {{USER_NAME}}:
{{CHAT_MESSAGE}}


From now on, you respond ONLY with character's persona messages.`,

  dialogInitializationInstructionPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}
${1/* TODO: finalize prompt! */}
`
};