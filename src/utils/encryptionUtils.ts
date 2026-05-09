// Utilitários para criptografia do lado cliente (dados não sensíveis)
// Storage format v2: "v2:<salt_b64>:<iv+ciphertext_b64>"
// Legacy v1 (no prefix) is still decryptable using the old static salt.

const LEGACY_SALT = 'helpaqui-salt-2024';
const STORAGE_VERSION = 'v2';

function bytesToB64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function b64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
}

export class ClientEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  // Derive a key from userId+purpose using a per-user random salt
  static async deriveKey(
    userId: string,
    purpose: string,
    salt: BufferSource
  ): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(userId + purpose),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt for localStorage with a fresh random salt per write
  static async encryptForStorage(data: string, userId: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await this.deriveKey(userId, 'storage', salt);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = this.encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return `${STORAGE_VERSION}:${bytesToB64(salt)}:${bytesToB64(combined)}`;
    } catch (error) {
      console.error('Encryption error');
      return data; // Fallback
    }
  }

  // Decrypt v2 (random salt) or v1 (legacy static salt) blobs
  static async decryptFromStorage(encryptedData: string, userId: string): Promise<string> {
    try {
      let salt: Uint8Array;
      let combined: Uint8Array;

      if (encryptedData.startsWith(`${STORAGE_VERSION}:`)) {
        const [, saltB64, payloadB64] = encryptedData.split(':');
        salt = b64ToBytes(saltB64);
        combined = b64ToBytes(payloadB64);
      } else {
        // Legacy fallback for already-stored values
        salt = this.encoder.encode(LEGACY_SALT);
        combined = b64ToBytes(encryptedData);
      }

      const key = await this.deriveKey(userId, 'storage', salt);
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error');
      return encryptedData; // Fallback
    }
  }

  // Hash seguro para comparações
  static async hashData(data: string): Promise<string> {
    const encoded = this.encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Token seguro para sessões temporárias
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Gerenciador de armazenamento seguro
export class SecureStorage {
  private static keyPrefix = 'helpaqui_secure_';

  static async setItem(key: string, value: string, userId: string): Promise<void> {
    try {
      const encrypted = await ClientEncryption.encryptForStorage(value, userId);
      localStorage.setItem(this.keyPrefix + key, encrypted);
    } catch (error) {
      console.error('Secure storage set error');
      localStorage.setItem(this.keyPrefix + key, value);
    }
  }

  static async getItem(key: string, userId: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.keyPrefix + key);
      if (!encrypted) return null;

      return await ClientEncryption.decryptFromStorage(encrypted, userId);
    } catch (error) {
      console.error('Secure storage get error');
      return localStorage.getItem(this.keyPrefix + key);
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(this.keyPrefix + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
