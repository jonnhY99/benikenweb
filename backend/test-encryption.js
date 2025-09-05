// Test script for encryption functionality
import dotenv from 'dotenv';
import { encrypt, decrypt, hashValue, verifyHash, encryptWithSalt, decryptWithSalt } from './config/encryption.js';

// Load environment variables
dotenv.config();

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
} catch (error) {
  console.error('❌ Basic encryption test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Hash functionality
console.log('Test 2: Hash Functionality');
try {
  const testData = 'sensitive-data-123';
  const hash1 = hashValue(testData);
  const hash2 = hashValue(testData);
  console.log('✅ Hash 1:', hash1);
  console.log('✅ Hash 2:', hash2);
  console.log('✅ Hashes match:', hash1 === hash2 ? 'YES' : 'NO');
  
  const isValid = verifyHash(testData, hash1);
  console.log('✅ Hash verification:', isValid ? 'VALID' : 'INVALID');
} catch (error) {
  console.error('❌ Hash test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Email encryption workflow (simulating user registration)
console.log('Test 3: Email Encryption Workflow');
try {
  const userEmail = 'usuario@beniken.com';
  
  // Encrypt email
  const encryptedEmail = encrypt(userEmail);
  console.log('✅ Encrypted email object:', encryptedEmail);
  
  // Create hash for search
  const emailHash = hashValue(encryptedEmail.data);
  console.log('✅ Email hash for search:', emailHash);
  
  // Decrypt email
  const decryptedEmail = decrypt(encryptedEmail);
  console.log('✅ Decrypted email:', decryptedEmail);
  console.log('✅ Email match:', userEmail === decryptedEmail ? 'YES' : 'NO');
  
  // Verify search hash
  const searchHash = hashValue(encrypt(userEmail).data);
  console.log('✅ Search hash matches:', emailHash === searchHash ? 'YES' : 'NO');
} catch (error) {
  console.error('❌ Email workflow test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 4: Salt encryption
console.log('Test 4: Salt Encryption');
try {
  const testName = 'Juan Pérez';
  const encryptedWithSalt = encryptWithSalt(testName);
  console.log('✅ Encrypted with salt:', encryptedWithSalt);
  
  const decryptedWithSalt = decryptWithSalt(encryptedWithSalt);
  console.log('✅ Decrypted with salt:', decryptedWithSalt);
  console.log('✅ Salt encryption match:', testName === decryptedWithSalt ? 'YES' : 'NO');
} catch (error) {
  console.error('❌ Salt encryption test failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 5: Error handling
console.log('Test 5: Error Handling');
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
  console.log('✅ Invalid decrypt result:', invalidResult);
} catch (error) {
  console.log('✅ Handled invalid decrypt:', error.message);
}

console.log('\n🎉 Encryption tests completed!');
