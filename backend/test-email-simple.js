import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Cargar variables de entorno
dotenv.config();

console.log('🧪 Prueba simple de SendGrid\n');

// Verificar configuración
console.log('📋 Variables de entorno:');
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
console.log(`MAIL_FROM: ${process.env.MAIL_FROM || 'No configurada'}`);

if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
  console.log('\n❌ ERROR: SENDGRID_API_KEY no configurada correctamente');
  process.exit(1);
}

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email de prueba simple
const msg = {
  to: 'axelfolymaldonadodz@gmail.com', // Email del usuario para prueba
  from: process.env.MAIL_FROM,
  subject: '🧪 Prueba de Email - Beniken Carnes',
  text: 'Este es un email de prueba para verificar que SendGrid funciona correctamente.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #10B981;">🥩 Beniken Carnes</h1>
      <h2>🧪 Prueba de Email</h2>
      <p>Este es un email de prueba para verificar que SendGrid funciona correctamente.</p>
      <p>Si recibes este email, la configuración está funcionando.</p>
    </div>
  `
};

try {
  console.log('\n📧 Enviando email de prueba...');
  await sgMail.send(msg);
  console.log('✅ Email enviado exitosamente!');
  console.log(`📤 Enviado desde: ${process.env.MAIL_FROM}`);
  console.log(`📥 Enviado a: axelfolymaldonadodz@gmail.com`);
} catch (error) {
  console.error('❌ Error enviando email:', error);
  
  if (error.code === 401) {
    console.log('\n💡 Solución: API Key inválida');
  } else if (error.code === 403) {
    console.log('\n💡 Solución: Email remitente no verificado en SendGrid');
  } else {
    console.log('\n💡 Error:', error.message);
  }
}
