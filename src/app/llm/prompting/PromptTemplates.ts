
export const promptTemplates = {
  buildExampleConversationPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}


### Instruction:
{{INSTRUCTION}}


### About conversation partner: 
You are talking with a person named {{USER_NAME}}. Here is information about them:
{{QUESTIONNAIRE}}


### Output Format:
{{OUTPUT_FORMAT}}`,

  coldConversationStartInstructionPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}


### Instruction:
{{INSTRUCTION}}


### About conversation partner: 
You are talking with a person named {{USER_NAME}}. Here is information about them:
{{QUESTIONNAIRE}}


### Example:
Here is an example of possible conversation between {{PERSONA_NAME}} and {{USER_NAME}}. Use it ONLY as an example of how you should behave:
{{CONVERSATION_EXAMPLE}}


From now on, you respond ONLY with messages of {{PERSONA_NAME}}.`,

  messageSummaryCreationInstructionPromptTemplate: `
### Instruction:
{{INSTRUCTION}}


### Message to summarize:
{{LAST_CHAT_MESSAGE}}


### Output Format:
{{OUTPUT_FORMAT}}`,

  generalDialogInstructionPromptTemplate: `
### Your Persona:
{{PERSONA_DESCRIPTION}}


### Instruction:
{{INSTRUCTION}}


### About conversation partner: 
You are talking with a person named {{USER_NAME}}. Here is information about them:
{{QUESTIONNAIRE}}


### Recent updates of {{USER_NAME}}:
Here are the recent updates of the life of {{USER_NAME}} based on the conversation you both had before.
Here is the summaries of messages:
{{SUMMARIZED_MESSAGES}}


### Last conversation messages:
{{CONVERSATION_MESSAGES}}


### Last message of {{USER_NAME}}:
{{LAST_CHAT_MESSAGE}}


From now on, you respond ONLY with messages of {{PERSONA_NAME}}.`
};