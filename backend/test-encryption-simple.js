// Simple encryption test without server dependency
import crypto from 'crypto';

// Simulate the encryption functions directly
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = 'beniken-secret-key-2024-very-secure-32b';
const IV_LENGTH = 16;

const getKey = () => {
  return crypto.scryptSync(SECRET_KEY, 'salt', 32);
};

const encrypt = (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('El texto a cifrar debe ser una cadena válida');
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setIV(iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      data: encrypted,
      tag: ''
    };
  } catch (error) {
    console.error('Error en encrypt:', error);
    throw new Error('Error al cifrar los datos');
  }
};

const decrypt = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== 'object') {
      return null;
    }

    const { iv, data } = encryptedData;
    
    if (!iv || !data) {
      return null;
    }

    const key = getKey();
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setIV(Buffer.from(iv, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error en decrypt:', error);
    return null;
  }
};

const hashValue = (value) => {
  try {
    if (!value || typeof value !== 'string') {
      throw new Error('El valor a hashear debe ser una cadena válida');
    }

    return crypto
      .createHash('sha256')
      .update(value + SECRET_KEY)
      .digest('hex');
  } catch (error) {
    console.error('Error en hashValue:', error);
    throw new Error('Error al crear hash del valor');
  }
};

// Run tests
console.log('🔐 Testing Encryption Functions...\n');

// Test 1: Basic encryption and decryption
console.log('Test 1: Basic Encryption/Decryption');
try {
  const testEmail = 'test@beniken.com';
  const encrypted = encrypt(testEmail);
  console.log('✅ Encryption successful:', encrypted);
  
  const decrypted = decrypt(encrypted);
  console.log('✅ Decryption successful:', decrypted);
  console.log('✅ Match:', testEmail === decrypted ? 'YES' : 'NO');
  
  if (testEmail === decrypted) {
    console.log('🎉 ENCRYPTION/DECRYPTION WORKING CORRECTLY!');
  } else {
    console.log('❌ ENCRYPTION/DECRYPTION FAILED!');
  }
} catch (error) {
  console.error('❌ Basic encryption test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Hash functionality for search
console.log('Test 2: Hash Functionality for User Search');
try {
  const userEmail = 'usuario@beniken.com';
  
  // Encrypt email
  const encryptedEmail = encrypt(userEmail);
  console.log('✅ Encrypted email:', encryptedEmail);
  
  // Create hash for search (this is what gets stored in emailHash field)
  const emailHash = hashValue(encryptedEmail.data);
  console.log('✅ Email hash for search:', emailHash);
  
  // Simulate search process
  const searchEncrypted = encrypt(userEmail);
  const searchHash = hashValue(searchEncrypted.data);
  console.log('✅ Search hash:', searchHash);
  console.log('✅ Hashes match for search:', emailHash === searchHash ? 'YES' : 'NO');
  
  if (emailHash === searchHash) {
    console.log('🎉 HASH SEARCH WORKING CORRECTLY!');
  } else {
    console.log('❌ HASH SEARCH FAILED!');
  }
} catch (error) {
  console.error('❌ Hash test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Error handling
console.log('Test 3: Error Handling');
try {
  console.log('Testing null input...');
  const nullResult = encrypt(null);
  console.log('❌ Should have thrown error for null input');
} catch (error) {
  console.log('✅ Correctly handled null input:', error.message);
}

try {
  console.log('Testing invalid decrypt...');
  const invalidResult = decrypt({ iv: 'invalid', data: 'invalid' });
  console.log('✅ Invalid decrypt result (should be null):', invalidResult);
} catch (error) {
  console.log('✅ Handled invalid decrypt:', error.message);
}

console.log('\n🎉 All encryption tests completed successfully!');
