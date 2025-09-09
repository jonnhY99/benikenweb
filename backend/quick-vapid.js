// Generador rápido de claves VAPID
const crypto = require('crypto');

// Generar clave privada (32 bytes aleatorios)
const privateKey = crypto.randomBytes(32);

// Generar clave pública usando curva elíptica P-256
const ecdh = crypto.createECDH('prime256v1');
ecdh.setPrivateKey(privateKey);
const publicKey = ecdh.getPublicKey();

// Convertir a base64url
function toBase64Url(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const publicKeyB64 = toBase64Url(publicKey);
const privateKeyB64 = toBase64Url(privateKey);

console.log('🔑 Claves VAPID generadas:');
console.log('');
console.log('BACKEND (.env):');
console.log(`VAPID_PUBLIC_KEY="${publicKeyB64}"`);
console.log(`VAPID_PRIVATE_KEY="${privateKeyB64}"`);
console.log('VAPID_SUBJECT="mailto:beniken382carnes@gmail.com"');
console.log('');
console.log('FRONTEND (.env):');
console.log(`REACT_APP_VAPID_PUBLIC_KEY="${publicKeyB64}"`);
console.log('');
console.log('📏 Información:');
console.log(`- Clave pública: ${publicKeyB64.length} caracteres`);
console.log(`- Clave privada: ${privateKeyB64.length} caracteres`);
console.log(`- Formato: P-256 válido`);
