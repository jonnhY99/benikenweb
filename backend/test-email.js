import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Cargar variables de entorno
dotenv.config();

// Importar funciones de email después de cargar dotenv
const { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation } = await import('./services/emailService.js');

// Datos de prueba para el pedido (coinciden con OrderStatusPage.js)
const testOrder = {
  orderNumber: 'TEST-001',
  id: 'test-order-id',
  customerName: 'Cliente de Prueba',
  customerEmail: 'test@example.com',
  customerPhone: '+56 9 1234 5678',
  pickupTime: '15:30',
  note: 'Sin grasa extra por favor',
  items: [
    {
      name: 'Asado de Tira',
      quantity: 1.500,
      unit: 'kg',
      price: 8500
    },
    {
      name: 'Posta Negra',
      quantity: 0.800,
      unit: 'kg', 
      price: 12000
    }
  ],
  status: 'Pendiente',
  paid: false,
  paymentMethod: 'transfer',
  createdAt: new Date()
};

const testEmail = 'test@example.com';

async function testEmailService() {
  console.log('🧪 Iniciando pruebas del servicio de email...\n');
  
  // Verificar configuración
  console.log('📋 Configuración de email:');
  console.log(`SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`MAIL_FROM: ${process.env.MAIL_FROM || 'noreply@beniken.cl'}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL || 'No configurada'}\n`);
  
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
    console.log('❌ ERROR: SENDGRID_API_KEY no está configurada correctamente');
    console.log('Por favor configura tu clave API de SendGrid en el archivo .env');
    console.log('\n📝 Pasos para configurar SendGrid:');
    console.log('1. Crear cuenta en SendGrid (https://sendgrid.com)');
    console.log('2. Generar API Key en Settings > API Keys');
    console.log('3. Verificar dominio del email remitente');
    console.log('4. Agregar SENDGRID_API_KEY=tu_clave_api al archivo .env');
    return;
  }
  
  // Test básico de conexión con SendGrid
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('🔑 SendGrid API Key configurada correctamente\n');
  } catch (error) {
    console.error('❌ Error configurando SendGrid:', error.message);
    return;
  }
  
  try {
    // Test 1: Confirmación de pedido (estado inicial)
    console.log('📧 Test 1: Enviando email de confirmación de pedido (Pendiente)...');
    await sendOrderConfirmation({...testOrder, status: 'Pendiente'}, testEmail);
    console.log('✅ Email de confirmación enviado exitosamente\n');
    
    // Test 2: Actualización a "En preparación"
    console.log('📧 Test 2: Enviando email de actualización - En preparación...');
    await sendOrderStatusUpdate({...testOrder, status: 'En preparación'}, testEmail, 'En preparación');
    console.log('✅ Email de actualización enviado exitosamente\n');
    
    // Test 3: Actualización a "Listo" (sin pago)
    console.log('📧 Test 3: Enviando email de actualización - Listo para retiro...');
    await sendOrderStatusUpdate({...testOrder, status: 'Listo', paid: false}, testEmail, 'Listo');
    console.log('✅ Email de actualización enviado exitosamente\n');
    
    // Test 4: Confirmación de pago
    console.log('📧 Test 4: Enviando email de confirmación de pago...');
    await sendPaymentConfirmation({...testOrder, status: 'Listo', paid: true}, testEmail);
    console.log('✅ Email de confirmación de pago enviado exitosamente\n');
    
    // Test 5: Actualización a "Entregado"
    console.log('📧 Test 5: Enviando email de actualización - Entregado...');
    await sendOrderStatusUpdate({...testOrder, status: 'Entregado', paid: true}, testEmail, 'Entregado');
    console.log('✅ Email de entrega enviado exitosamente\n');
    
    console.log('🎉 Todas las pruebas del flujo completo de emails completadas exitosamente!');
    console.log('📊 Flujo probado: Pendiente → En preparación → Listo → Pago → Entregado');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas de email:', error);
    
    if (error.code === 401) {
      console.log('\n💡 Solución: Verifica que tu SENDGRID_API_KEY sea correcta');
    } else if (error.code === 403) {
      console.log('\n💡 Solución: Verifica que el email remitente esté verificado en SendGrid');
    } else if (error.message?.includes('network')) {
      console.log('\n💡 Solución: Verifica tu conexión a internet');
    }
  }
}

// Ejecutar las pruebas
testEmailService().catch(console.error);
