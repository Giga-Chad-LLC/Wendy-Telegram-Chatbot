import { ApplicationError } from '../../../errors/ApplicationError';

/**
 * Defines a set of available prompt template variables.
 */
export enum PromptTemplateVariables {
  PERSONA_DESCRIPTION = '{{PERSONA_DESCRIPTION}}',
  PERSONA_NAME = '{{PERSONA_NAME}}',

  USER_NAME = '{{USER_NAME}}',
  QUESTIONNAIRE = '{{QUESTIONNAIRE}}',
  CHAT_MESSAGE = '{{CHAT_MESSAGE}}',
  SUMMARIZED_MESSAGES = '{{SUMMARIZED_MESSAGES}}',
  CONVERSATION_MESSAGES = '{{CONVERSATION_MESSAGES}}',

  INSTRUCTION = '{{INSTRUCTION}}',
  OUTPUT_FORMAT = '{{OUTPUT_FORMAT}}',
  CONVERSATION_EXAMPLE = '{{CONVERSATION_EXAMPLE}}',
}

export namespace PromptTemplateVariables {
  export function fromString(variable: string) {
    switch (variable) {
      case '{{PERSONA_DESCRIPTION}}': return PromptTemplateVariables.PERSONA_DESCRIPTION;
      case '{{PERSONA_NAME}}': return PromptTemplateVariables.PERSONA_NAME;

      case '{{USER_NAME}}': return PromptTemplateVariables.USER_NAME;
      case '{{QUESTIONNAIRE}}': return PromptTemplateVariables.QUESTIONNAIRE;
      case '{{CHAT_MESSAGE}}': return PromptTemplateVariables.CHAT_MESSAGE;
      case '{{SUMMARIZED_MESSAGES}}': return PromptTemplateVariables.SUMMARIZED_MESSAGES;
      case '{{CONVERSATION_MESSAGES}}': return PromptTemplateVariables.CONVERSATION_MESSAGES;

      case '{{INSTRUCTION}}': return PromptTemplateVariables.INSTRUCTION;
      case '{{OUTPUT_FORMAT}}': return PromptTemplateVariables.OUTPUT_FORMAT;
      case '{{CONVERSATION_EXAMPLE}}': return PromptTemplateVariables.CONVERSATION_EXAMPLE;
      default: throw new ApplicationError(`Provided variable '${variable}' cannot be converted to enum`)
    }
  }
}


/**
 * Serves as a sentinel for secure prompt template modifications and variable populations.
 * Implements Builder Design Pattern.
 * </br>
 * @example
 * ```typescript
 * const promptTemplate = PromptTemplate(myTemplate);
 *
 * const populatedPrompt = promptTemplate
 *    .set(PromptTemplateVariables.PERSONA, "Persona definition here")
 *    .set(PromptTemplateVariables.INSTRUCTION, "Instruction")
 *    .build();
 * ```
 */
export class PromptTemplate {
  private static readonly variableRegex = /(\{\{\w*}})/g;
  private readonly template: string;
  private readonly variableAssignments: Map<PromptTemplateVariables, string> = new Map();

  /**
   * Creates an instance of `PromptTemplate`.
   * Requires `template` to have only variables present in `PromptTemplateVariables`.
   *
   * @param template template which will be populated via `set` commands.
   */
  constructor(template: string) {
    PromptTemplate.validateTemplate(template);
    this.template = template;
  }

  /**
   * Asserts that the variable is present in the stored template and associates this variable
   * with the provided value.
   * </br>
   * Subsequent calls will apply the <b>value of the last call</b>.
   *
   * @param variable variable to set
   * @param value value to set
   */
  set(variable: PromptTemplateVariables, value: string): PromptTemplate {
    if (!this.has(variable)) {
      throw new ApplicationError(`Variable '${variable}' is not present in the prompt template`)
    }

    this.variableAssignments.set(variable, value);
    return this
  }

  /**
   * Checks whether the provided variable is present in the stored prompt template.
   *
   * @param variable variable the entry of which to check
   */
  has(variable: PromptTemplateVariables): boolean {
    return this.template.includes(variable as string)
  }

  /**
   * Builds a prompt populated with the values associated with variables previously provided by `set` method.
   * <br/>
   * Requires that all variables present in the prompt to have an associated value.
   *
   * @return populated prompt
   */
  build(): string {
    let builtPrompt = this.template;
    const variables = PromptTemplate.collectPromptTemplateVariables(this.template);

    for (const variable of variables) {
      const enumVariable = PromptTemplateVariables.fromString(variable);

      if (!this.variableAssignments.has(enumVariable)) {
        throw new ApplicationError(`Variable '${variable}' is not set but present in the template`);
      }

      const value = this.variableAssignments.get(enumVariable)!;
      builtPrompt = builtPrompt.replace(variable, value);
    }

    return builtPrompt;
  }

  /**
   * Checks that template has only variables registered in enum `PromptTemplateVariables`.
   *
   * @param template template variables of which to check
   * @private
   */
  private static validateTemplate(template: string) {
    const variables = PromptTemplate.collectPromptTemplateVariables(template)

    variables.forEach(usedVariable => {
      let found = false;
      for (const registeredVariable in PromptTemplateVariables) {
        const enumVariableValue = PromptTemplateVariables[registeredVariable as keyof typeof PromptTemplateVariables];

        if (usedVariable == enumVariableValue) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw new ApplicationError(`Variable '${usedVariable}' not found among the registered variables`);
      }
    });
  }


  /**
   * Collects all variables present in the provided `template`.
   * The return array contains only <b>unique variables</b>, i.e. duplicates are ignored.
   *
   * @param template template from which to collect unique variables
   * @private
   */
  private static collectPromptTemplateVariables(template: string): string[] {
    const matches = template.matchAll(PromptTemplate.variableRegex);
    const variables: string[] = [];

    for (const match of matches) {
      if (match[1] && !variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables
  }


}