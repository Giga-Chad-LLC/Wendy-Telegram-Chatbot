import { describe, expect, it } from 'vitest';
import { PromptTemplate, PromptTemplateVariables } from '../src/app/llm/prompt/template/PromptTemplate';
import { ApplicationError } from '../src/app/errors/ApplicationError';
import { AESEncryptor, ISymmetricEncryptor } from '../src/app/encription/ISymmetricEncryptor';
import { AbstractLlmDialogController } from '../src/controllers/AbstractLlmDialogController';
import { LlmDialogController } from '../src/controllers/LlmDialogController';
import { LlmDialogManager } from '../src/app/llm/conversation/LlmDialogManager';
import { OpenAILlmProvider } from '../src/app/llm/providers/OpenAILlmProvider';
import { OPENAI_API_KEY } from '../env';
import { Wendy } from '../src/app/llm/prompt/configs/Personas';


describe('Encryption', () => {

  describe('AESEncryptor', () => {
    let encryptor: ISymmetricEncryptor

    beforeEach(() => {
      const key = 'my secret key';
      encryptor = new AESEncryptor({ key });
    });

    it('should return the same text after encrypt-decrypt cycle', () => {
      const text = 'Hello, World! This is my new text here!';
      const ciphertext = encryptor.encrypt(text);
      const decryptedText = encryptor.decrypt(ciphertext);

      console.log(`text: "${text}"`)
      console.log(`ciphertext: "${ciphertext}"`)
      console.log(`decryptedText: "${decryptedText}"`)

      expect(ciphertext).not.equal(text, "Ciphertext must not match the text");
      expect(decryptedText).to.equal(text, "Decrypted text must match the text");
    });
  });

  describe('LlmDialogControllerEncryptionDecorator', () => {
    let controller: AbstractLlmDialogController

    beforeEach(() => {
      const key = 'my secret key';
      const encryptor = new AESEncryptor({ key });

      const llmProvider = new OpenAILlmProvider({
        token: OPENAI_API_KEY,
        model: 'gpt-4o',
      });
      const llmDialogManager = new LlmDialogManager(llmProvider);

      /*decoratedController = new LlmDialogControllerEncryptionDecorator({
        controller: new LlmDialogController(llmDialogManager),
        encryptor: encryptor,
        noOp: false,
      });*/
      controller = new LlmDialogController(llmDialogManager, encryptor);
    });

    it('should store encrypted messages when cold conversing', async () => {
      const myTelegramUserId = 1087620020;
      const persona = new Wendy();

      const assistantMessage = await controller.converseCold({
        userId: myTelegramUserId,
        persona,
      });

      console.log(assistantMessage.content);
    }, -1);

    it('should store encrypted messages & build history from decrypted when conversing', async () => {
      const myTelegramUserId = 1087620020;
      const persona = new Wendy();
      const lastUserMessageContent = 'Hello! I got just wake up! I have a good mood for the day.';

      const assistantMessage = await controller.converse({
        userId: myTelegramUserId,
        persona,
        lastUserMessageContent,
      });

      console.log(assistantMessage.content);
    }, -1);
  });

});