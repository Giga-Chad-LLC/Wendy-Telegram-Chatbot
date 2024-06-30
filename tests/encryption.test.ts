import { describe, expect, it } from 'vitest';
import { PromptTemplate, PromptTemplateVariables } from '../src/app/llm/prompt/template/PromptTemplate';
import { ApplicationError } from '../src/app/errors/ApplicationError';
import { AESEncryptor, ISymmetricEncryptor } from '../src/app/encription/ISymmetricEncryptor';


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


});