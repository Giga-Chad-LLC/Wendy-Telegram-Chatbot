import { ApplicationError } from '../../../errors/ApplicationError';

export enum PromptTemplateVariables {
  PERSONA = '{{Persona}}',
  PERSONA_NAME = '{{PersonaName}}',

  USER_NAME = '{{UserName}}',
  QUESTIONNAIRE = '{{Questionnaire}}',
  CHAT_MESSAGE = '{{ChatMessage}}',
  // TODO: define message summaries & last messages

  INSTRUCTION = '{{Instruction}}',
  OUTPUT_FORMAT = '{{OutputFormat}}',
  CONVERSATION_EXAMPLE = '{{ConversationExample}}',
}


export class PromptTemplate {
  private static readonly variableRegex = /(\{\{\w*}})/g;
  private readonly template: string;
  private readonly variableAssignments: Map<PromptTemplateVariables, string> = new Map();

  constructor(template: string) {
    PromptTemplate.validateTemplate(template);
    this.template = template;
  }

  set(variable: PromptTemplateVariables, value: string): PromptTemplate {
    if (!this.has(variable)) {
      throw new ApplicationError(`Variable '${variable}' is not present in the prompt template`)
    }

    this.variableAssignments.set(variable, value);
    return this
  }

  has(variable: PromptTemplateVariables): boolean {
    return this.template.includes(variable as string)
  }

  /**
   * Checks that template has only variables registered in enum `PromptTemplateVariables`.
   *
   * @param template template variables of which to check
   * @private
   */
  private static validateTemplate(template: string) {
    const matches = template.matchAll(PromptTemplate.variableRegex);

    const variables: string[] = [];

    for (const match of matches) {
      if (match[1]) {
        variables.push(match[1]);
      }
    }

    variables.forEach(usedVariable => {
      let found = false;
      for (const registeredVariable in PromptTemplateVariables) {
        if (usedVariable == registeredVariable) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new ApplicationError(`Variable '${usedVariable}' not found among the registered variables`);
      }
    });
  }
}