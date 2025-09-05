import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 DIAGNÓSTICO DEL FLUJO DE COMPRA Y EMAILS\n');

// 1. Verificar configuración de SendGrid
console.log('📧 Configuración de SendGrid:');
console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? 'SG.' + process.env.SENDGRID_API_KEY.substring(3, 13) + '...' : '❌ NO CONFIGURADA'}`);
console.log(`MAIL_FROM: ${process.env.MAIL_FROM || '❌ NO CONFIGURADA'}`);
console.log(`CLIENT_URL: ${process.env.CLIENT_URL || '❌ NO CONFIGURADA'}\n`);

// 2. Simular el payload que envía el frontend
const simulatedPayload = {
  customerName: 'Cliente Prueba',
  customerPhone: '+56912345678',
  customerEmail: 'axelfolymaldonadodz@gmail.com', // Email del usuario
  pickupTime: '15:30',
  note: 'Pedido de prueba',
  status: 'Pendiente',
  totalCLP: 15000,
  items: [
    {
      productId: 'test-id',
      name: 'Asado de Tira',
      quantity: 1.5,
      unit: 'kg',
      price: 10000
    }
  ]
};

console.log('📦 Payload simulado del frontend:');
console.log(JSON.stringify(simulatedPayload, null, 2));
console.log('\n🔍 Verificando campo customerEmail:', simulatedPayload.customerEmail);

// 3. Probar envío directo de email
try {
  const { sendOrderConfirmation } = await import('./services/emailService.js');
  
  console.log('\n📧 Probando envío directo de email...');
  
  const testOrder = {
    id: 'TEST-001',
    orderNumber: 'TEST-001',
    ...simulatedPayload
  };
  
  await sendOrderConfirmation(testOrder, simulatedPayload.customerEmail);
  console.log('✅ Email enviado exitosamente!');
  
} catch (error) {
  console.error('❌ Error en envío de email:', error.message);
  
  if (error.code === 401) {
    console.log('💡 Problema: API Key de SendGrid inválida');
  } else if (error.code === 403) {
    console.log('💡 Problema: Email remitente no verificado en SendGrid');
  } else if (error.message?.includes('ENOTFOUND')) {
    console.log('💡 Problema: Sin conexión a internet');
  } else {
    console.log('💡 Error completo:', error);
  }
}

console.log('\n📋 INSTRUCCIONES PARA PROBAR:');
console.log('1. Haz una compra real en la plataforma');
console.log('2. Usa el email: axelfolymaldonadodz@gmail.com');
console.log('3. Revisa la consola del backend para ver logs de debug');
console.log('4. Verifica tu bandeja de entrada y spam');
