const crypto = require('crypto');
const env = require('../config/env');

class EncryptionUtils {
  
  generateContentKey() {
    return crypto.randomBytes(32);
  }

  deriveDeviceSecret(userId, deviceId) {
    const data = `${env.ENCRYPTION_SECRET}:${userId}:${deviceId}`;
    return crypto.createHash('sha256').update(data).digest();
  }

  wrapContentKey(contentKey, deviceSecret) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', deviceSecret, iv);
    
    let encrypted = cipher.update(contentKey);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  unwrapContentKey(wrappedKey, deviceSecret) {
    const data = Buffer.from(wrappedKey, 'base64');
    
    const iv = data.slice(0, 16);
    const authTag = data.slice(16, 32);
    const encrypted = data.slice(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', deviceSecret, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  encryptContent(content, contentKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', contentKey, iv);
    
    let encrypted = cipher.update(content, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  decryptContent(encryptedBuffer, contentKey) {
    const iv = encryptedBuffer.slice(0, 16);
    const authTag = encryptedBuffer.slice(16, 32);
    const encrypted = encryptedBuffer.slice(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', contentKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  generateChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new EncryptionUtils();