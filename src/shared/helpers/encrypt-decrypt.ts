import * as crypto from 'crypto';

export class EncryptDecryptService {
  algorithm: string;
  key: Buffer;
  iv: Buffer;

  constructor() {
    this.algorithm = process.env.CRYPTO_ALGORITHM;
    this.key = Buffer.from(process.env.CRYPTO_KEY as string, 'hex');
    this.iv = Buffer.from(process.env.CRYPTO_IV as string, 'hex');
  }

  /**
   *
   * @param text Original string
   * @returns Encrypted String
   */
  encrypt = (text: string): string => {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (_error) {
      throw new Error(`Encryption failed for ${text}`);
    }
  };

  /**
   *
   * @param encryptedText Encrypted string
   * @returns Original string
   */
  decrypt = (encryptedText: string): string => {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        this.iv,
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (_error) {
      throw new Error(`Decryption failed for ${encryptedText}`);
    }
  };
}
