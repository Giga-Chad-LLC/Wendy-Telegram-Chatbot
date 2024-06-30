import CryptoJS from 'crypto-js';


/**
 * Provides a user-friendly interface for <b>symmetric</b> text encryption.
 * The primary use is to encrypt messages before storing them in the database via, e.g., AES.
 * </br>
 * The algorithm's key is not present in the methods APIs in order to simplify the client use.
 * Key should be supplied via constructor and used throughout the lifetime of an exact instance.
 */
export interface ISymmetricEncryptor {
  /**
   * Encrypts the provided text and returns its FULL ciphertext.
   * </br>
   * @example
   * ```ts
   * const text = "Hello, world";
   * // having 'encryptor' of type 'IEncryptor'
   * const ciphertext = encryptor.encrypt(text);
   * ```
   *
   * @param text text to encrypt.
   * @return ciphertext yielded from the `text` via an underlying encryption algorithm.
   */
  encrypt(text: string): string;
  decrypt(ciphertext: string): string;
}


export class AESEncryptor implements ISymmetricEncryptor {
  private readonly key: string;

  constructor({ key }: AESEncryptorParams) {
    this.key = key;
  }

  encrypt(text: string): any {
    // ciphertext
    return CryptoJS.AES.encrypt(text, this.key).toString();
  }

  decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.key);
    // original text
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

export type AESEncryptorParams = {
  key: string;
}