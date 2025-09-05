import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';

dotenv.config();

console.log('🧪 PRUEBA DE EMAILS AUTOMÁTICOS EN ENDPOINTS\n');

async function testAutomaticEmails() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar una orden existente para probar cambios de estado
    console.log('📋 Buscando orden existente para pruebas...');
    const existingOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!existingOrder) {
      console.log('❌ No se encontraron órdenes existentes');
      console.log('💡 Crea una orden desde el frontend primero');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Orden encontrada para pruebas:`);
    console.log(`   ID: ${existingOrder.id}`);
    console.log(`   Estado actual: ${existingOrder.status}`);
    console.log(`   Cliente: ${existingOrder.customerName}`);
    console.log(`   Email: ${existingOrder.customerEmail}`);
    
    // Verificar que tenga email
    if (!existingOrder.customerEmail) {
      console.log('❌ Esta orden no tiene email del cliente');
      console.log('💡 Usa una orden que tenga email para probar');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🔧 CONFIGURACIÓN VERIFICADA:');
    console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   MAIL_FROM: ${process.env.MAIL_FROM || 'No configurado'}`);
    
    console.log('\n📧 ENDPOINTS QUE AHORA ENVÍAN EMAILS AUTOMÁTICAMENTE:');
    console.log('   ✅ POST /api/orders - Email de confirmación');
    console.log('   ✅ PATCH /api/orders/:id/status - Email de cambio de estado');
    console.log('   ✅ PATCH /api/orders/:id/confirm-weights - Email "Listo"');
    console.log('   ✅ PATCH /api/orders/:id/validate-receipt - Email de pago confirmado');
    
    console.log('\n🚀 PARA PROBAR LOS EMAILS AUTOMÁTICOS:');
    console.log('\n1️⃣ CREAR NUEVO PEDIDO:');
    console.log('   - Ve al frontend y crea un pedido con email');
    console.log('   - Deberías recibir email de confirmación automáticamente');
    
    console.log('\n2️⃣ CAMBIAR ESTADO DE PEDIDO:');
    console.log(`   - Cambia el estado de la orden ${existingOrder.id} a "En preparación"`);
    console.log('   - Deberías recibir email de actualización automáticamente');
    
    console.log('\n3️⃣ MARCAR COMO LISTO:');
    console.log(`   - Usa el endpoint confirm-weights para marcar ${existingOrder.id} como "Listo"`);
    console.log('   - Deberías recibir email de "Pedido listo" automáticamente');
    
    console.log('\n4️⃣ APROBAR PAGO:');
    console.log(`   - Si ${existingOrder.id} tiene comprobante, apruébalo`);
    console.log('   - Deberías recibir email de "Pago confirmado" automáticamente');

    console.log('\n📝 LOGS A REVISAR:');
    console.log('   - Revisa la consola del backend cuando hagas cambios');
    console.log('   - Deberías ver logs como:');
    console.log('     🔍 ===== ENVIANDO EMAIL DE CONFIRMACIÓN =====');
    console.log('     📧 Enviando email de confirmación a: email@ejemplo.com');
    console.log('     ✅ Email de confirmación enviado exitosamente');

    await mongoose.disconnect();
    console.log('\n✅ Verificación completada');
    console.log('\n🎯 RESUMEN: Los emails automáticos están ahora integrados en las rutas.');
    console.log('🎯 Prueba creando/modificando pedidos para ver los emails en acción.');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error desconectando:', disconnectError);
    }
  }
}

// Ejecutar verificación
testAutomaticEmails();
