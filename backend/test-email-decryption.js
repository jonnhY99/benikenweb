import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 PRUEBA DE DESENCRIPTACIÓN DE EMAILS\n');

// Importar funciones de encriptación
const { encrypt, decrypt } = await import('./config/encryption.js');

// Email de prueba
const originalEmail = 'axelfolymaldonadodz@gmail.com';

console.log('📧 Email original:', originalEmail);

// Encriptar email (simular lo que hace el sistema)
const encryptedEmail = encrypt(originalEmail);
console.log('🔒 Email encriptado:', encryptedEmail);

// Desencriptar email (lo que debe hacer el sistema de emails)
const decryptedEmail = decrypt(encryptedEmail);
console.log('🔓 Email desencriptado:', decryptedEmail);

// Verificar que coinciden
const isMatch = originalEmail === decryptedEmail;
console.log(`✅ Coincidencia: ${isMatch ? 'SÍ' : 'NO'}`);

// Probar la lógica de detección
console.log('\n🔍 Prueba de detección de encriptación:');
console.log(`Email normal contiene @: ${originalEmail.includes('@')}`);
console.log(`Email encriptado contiene @: ${encryptedEmail.includes('@')}`);

// Simular el flujo del controlador
console.log('\n🧪 Simulando flujo del controlador:');

function processEmailForSending(email) {
  console.log(`📥 Email recibido: ${email}`);
  
  if (email && !email.includes('@')) {
    console.log('🔍 Email parece encriptado, desencriptando...');
    try {
      const decrypted = decrypt(email);
      console.log(`🔓 Email desencriptado: ${decrypted}`);
      return decrypted;
    } catch (error) {
      console.log(`❌ Error desencriptando: ${error.message}`);
      return email;
    }
  } else {
    console.log('✅ Email ya está en formato normal');
    return email;
  }
}

// Probar con email normal
console.log('\n--- Prueba con email normal ---');
processEmailForSending(originalEmail);

// Probar con email encriptado
console.log('\n--- Prueba con email encriptado ---');
processEmailForSending(encryptedEmail);
