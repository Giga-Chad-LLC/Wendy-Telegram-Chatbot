import { describe, expect, it } from 'vitest';
import { PromptTemplate, PromptTemplateVariables } from '../src/app/llm/prompt/template/PromptTemplate';
import { ApplicationError } from '../src/app/errors/ApplicationError';


describe('PromptTemplate', () => {
  let promptTemplate: PromptTemplate;

  beforeEach(() => {
    // Initialize a new PromptTemplate instance before each test
    promptTemplate = new PromptTemplate('{{PERSONA_NAME}} is {{PERSONA_DESCRIPTION}}');
  });

  describe('constructor', () => {
    it('should initialize with valid template', () => {
      expect(promptTemplate).toBeInstanceOf(PromptTemplate);
    });

    it('should throw error with invalid template', () => {
      expect(() => new PromptTemplate('{{INVALID_VARIABLE_101}}')).toThrow(ApplicationError);
    });
  });

  describe('set', () => {
    it('should set variable and return PromptTemplate instance', () => {
      promptTemplate.set(PromptTemplateVariables.PERSONA_NAME, 'John');
      expect(promptTemplate.has(PromptTemplateVariables.PERSONA_NAME)).toBe(true);
    });

    it('should throw error for setting non-existent variable', () => {
      expect(() => promptTemplate.set(PromptTemplateVariables.USER_NAME, 'Jane')).toThrow(ApplicationError);
    });
  });

  describe('has', () => {
    it('should return true for existing variable', () => {
      expect(promptTemplate.has(PromptTemplateVariables.PERSONA_NAME)).toBe(true);
    });

    it('should return false for non-existent variable', () => {
      expect(promptTemplate.has(PromptTemplateVariables.QUESTIONNAIRE)).toBe(false);
    });
  });

  describe('build', () => {
    it('should populate template with set variables', () => {
      promptTemplate.set(PromptTemplateVariables.PERSONA_NAME, 'John');
      promptTemplate.set(PromptTemplateVariables.PERSONA_DESCRIPTION, 'a developer');
      const populatedPrompt = promptTemplate.build();
      expect(populatedPrompt).toBe('John is a developer');
    });

    it('should throw error if not all variables are set', () => {
      expect(() => promptTemplate.build()).toThrow(ApplicationError);
    });
  });

  describe('validateTemplate', () => {
    it('should validate template with valid variables', () => {
      expect(() => PromptTemplate.validateTemplate('{{PERSONA_NAME}}')).not.toThrow(ApplicationError);
    });

    it('should throw error with invalid variables', () => {
      expect(() => PromptTemplate.validateTemplate('{{INVALID_VARIABLE}}')).toThrow(ApplicationError);
    });
  });

  describe('collectPromptTemplateVariables', () => {
    it('should collect unique variables from template', () => {
      const variables = PromptTemplate.collectPromptTemplateVariables('{{PERSONA_NAME}} is {{PERSONA_DESCRIPTION}}');
      expect(variables).toEqual(['{{PERSONA_NAME}}', '{{PERSONA_DESCRIPTION}}']);
    });

    it('should handle duplicate variables', () => {
      const variables = PromptTemplate.collectPromptTemplateVariables('{{PERSONA_NAME}} is {{PERSONA_NAME}}');
      expect(variables).toEqual(['{{PERSONA_NAME}}']);
    });
  });

  describe('checkDifferentVariables', () => {
    it('should substitute {{USER_NAME}} with provided name', () => {
      const template = new PromptTemplate('{{PERSONA_NAME}} is {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, 'John')
        .set(PromptTemplateVariables.PERSONA_NAME, 'Wendy')
        .build();

      expect(prompt).toEqual('Wendy is John');
    });
  });

  describe('edgeCases', () => {
    it('should substitute all entries of variables with a value', () => {
      const template = new PromptTemplate(
        'My name is {{USER_NAME}}, My persona is {{USER_NAME}}. I am {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, 'John')
        .build();

      expect(prompt).toEqual('My name is John, My persona is John. I am John');
    });

    it('should set the value of the last set() call', () => {
      const template = new PromptTemplate(
        'My name is {{USER_NAME}}, My persona is {{USER_NAME}}. I am {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, 'John')
        .set(PromptTemplateVariables.USER_NAME, 'Simon')
        .set(PromptTemplateVariables.USER_NAME, 'Cameron')
        .build();

      expect(prompt).toEqual('My name is Cameron, My persona is Cameron. I am Cameron');
    });

    it('should not fail if value is equal to its variable name', () => {
      const template = new PromptTemplate(
        'My name is {{USER_NAME}}, My persona is {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, '{{USER_NAME}}')
        .build();

      expect(prompt).toEqual('My name is {{USER_NAME}}, My persona is {{USER_NAME}}');
    });

    it('should not fail if value is equal to another variable name', () => {
      const template = new PromptTemplate(
        'My name is {{USER_NAME}}, My persona is {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, '{{OUTPUT_FORMAT}}')
        .build();

      expect(prompt).toEqual('My name is {{OUTPUT_FORMAT}}, My persona is {{OUTPUT_FORMAT}}');
    });

    it('should not fail if value is equal to non-existent variable name', () => {
      const template = new PromptTemplate(
        'My name is {{USER_NAME}}, My persona is {{USER_NAME}}');

      const prompt = template
        .set(PromptTemplateVariables.USER_NAME, '{{NON_EXISTENT_VARIABLE_NAME}}')
        .build();

      expect(prompt).toEqual('My name is {{NON_EXISTENT_VARIABLE_NAME}}, My persona is {{NON_EXISTENT_VARIABLE_NAME}}');
    });

  });

});