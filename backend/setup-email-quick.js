import fs from 'fs';
import path from 'path';

console.log('🔧 Configuración rápida de emails para Beniken\n');

// Verificar si existe .env
const envPath = '.env';
const envExamplePath = '.env.example';

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    // Copiar .env.example a .env
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Archivo .env creado desde .env.example');
  } else {
    // Crear .env básico
    const envContent = `# MongoDB
MONGODB_URI=mongodb://localhost:27017/beniken_db

# JWT Secret
JWT_SECRET=beniken-jwt-secret-2024

# Server
PORT=5000
NODE_ENV=development

# CORS
CLIENT_URL=http://localhost:3000,http://localhost:3001

# Email (SendGrid) - CONFIGURAR ESTAS VARIABLES
SENDGRID_API_KEY=your_sendgrid_api_key_here
MAIL_FROM=noreply@beniken.cl

# Encryption
ENCRYPTION_SECRET=beniken-encryption-key-2024-very-secure-32bytes-long
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado con configuración básica');
  }
} else {
  console.log('✅ Archivo .env ya existe');
}

console.log('\n📧 CONFIGURACIÓN DE EMAILS REQUERIDA:');
console.log('━'.repeat(50));
console.log('Para que funcionen los emails, necesitas:');
console.log('');
console.log('1. 🔑 SENDGRID_API_KEY');
console.log('   • Crear cuenta en https://sendgrid.com');
console.log('   • Ir a Settings > API Keys');
console.log('   • Crear API Key con permisos "Mail Send"');
console.log('   • Reemplazar "your_sendgrid_api_key_here" en .env');
console.log('');
console.log('2. 📧 MAIL_FROM');
console.log('   • Verificar dominio en SendGrid');
console.log('   • O usar email individual verificado');
console.log('   • Ejemplo: noreply@tudominio.com');
console.log('');
console.log('📝 Edita el archivo .env y luego ejecuta:');
console.log('   node email-diagnosis.js  (para verificar configuración)');
console.log('   node test-email.js       (para probar envío)');
console.log('');
console.log('🚀 Una vez configurado, los emails se enviarán automáticamente');
console.log('   cuando los clientes hagan pedidos y cambien de estado.');
