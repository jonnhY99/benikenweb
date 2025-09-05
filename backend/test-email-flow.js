import dotenv from 'dotenv';
dotenv.config();

console.log('📧 PRUEBA DEL FLUJO COMPLETO DE EMAILS\n');

// Importar funciones necesarias
const { sendOrderConfirmation } = await import('./services/emailService.js');
const { encrypt, decrypt } = await import('./config/encryption.js');

// Simular datos de pedido completos
const testOrder = {
  id: 'TEST-ORDER-001',
  orderNumber: 'BEN-2024-TEST-001',
  customerName: 'Cliente Prueba',
  customerPhone: '+56912345678',
  customerEmail: 'axelfolymaldonadodz@gmail.com', // Email real para prueba
  pickupTime: '15:30',
  note: 'Pedido de prueba para verificar emails',
  status: 'Pendiente',
  items: [
    {
      productId: '1',
      name: 'Asado de Tira',
      quantity: 2,
      unit: 'kg',
      price: 8500
    },
    {
      productId: '2', 
      name: 'Pollo Entero',
      quantity: 1,
      unit: 'unidad',
      price: 4500
    }
  ],
  totalCLP: 21500,
  paid: false,
  paymentMethod: null,
  createdAt: new Date()
};

console.log('🔍 1. Probando con email normal (no encriptado)...');
try {
  await sendOrderConfirmation(testOrder, testOrder.customerEmail);
  console.log('✅ Email enviado exitosamente con email normal');
} catch (error) {
  console.error('❌ Error enviando email normal:', error.message);
}

console.log('\n🔍 2. Probando con email encriptado...');
try {
  // Encriptar el email como lo haría el sistema
  const encryptedEmail = encrypt(testOrder.customerEmail);
  console.log('🔒 Email encriptado:', encryptedEmail);
  
  // Simular la lógica de desencriptación del controlador
  let emailToSend = encryptedEmail;
  
  // Verificar si el email está encriptado (no contiene @)
  if (typeof emailToSend === 'object' && emailToSend.iv && emailToSend.data) {
    console.log('🔍 Email detectado como encriptado, desencriptando...');
    emailToSend = decrypt(emailToSend);
    console.log('🔓 Email desencriptado:', emailToSend);
  }
  
  await sendOrderConfirmation(testOrder, emailToSend);
  console.log('✅ Email enviado exitosamente con email desencriptado');
} catch (error) {
  console.error('❌ Error enviando email encriptado:', error.message);
}

console.log('\n🔍 3. Verificando configuración de SendGrid...');
try {
  const sgMail = (await import('@sendgrid/mail')).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  console.log('✅ SendGrid API Key configurada');
  console.log('📧 Email remitente:', process.env.MAIL_FROM);
  console.log('🌐 URL del cliente:', process.env.CLIENT_URL);
} catch (error) {
  console.error('❌ Error con configuración SendGrid:', error.message);
}

console.log('\n📋 RESUMEN:');
console.log('- Verifica que los emails lleguen a:', testOrder.customerEmail);
console.log('- Revisa la carpeta de spam si no llegan');
console.log('- Los logs del backend mostrarán si hay errores');
