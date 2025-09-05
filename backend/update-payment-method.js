import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';

dotenv.config();

console.log('🔧 SCRIPT PARA ACTUALIZAR MÉTODO DE PAGO DE PEDIDOS\n');

/**
 * Función para actualizar el método de pago de un pedido
 * @param {string} orderId - ID del pedido
 * @param {string} paymentMethod - 'online' o 'local'
 */
async function updatePaymentMethod(orderId, paymentMethod) {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Validar método de pago
    if (!['online', 'local'].includes(paymentMethod)) {
      throw new Error('Método de pago debe ser "online" o "local"');
    }

    // Buscar y actualizar el pedido
    console.log(`🔍 Buscando pedido: ${orderId}`);
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error(`Pedido no encontrado: ${orderId}`);
    }

    console.log(`📋 Pedido encontrado:`);
    console.log(`   Estado actual: ${order.status}`);
    console.log(`   Método de pago actual: ${order.paymentMethod || 'No definido'}`);
    console.log(`   Cliente: ${order.customerName}`);

    // Actualizar método de pago
    order.paymentMethod = paymentMethod;
    
    // Si es pago local y está listo, cambiar estado
    if (paymentMethod === 'local' && order.status === 'Listo') {
      order.status = 'Pendiente pago';
      console.log(`🔄 Estado cambiado a "Pendiente pago" para pago local`);
    }

    await order.save();
    
    console.log(`✅ Método de pago actualizado exitosamente:`);
    console.log(`   Nuevo método: ${order.paymentMethod}`);
    console.log(`   Estado final: ${order.status}`);

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error desconectando:', disconnectError);
    }
  }
}

// Ejemplo de uso:
// updatePaymentMethod('PEDIDO_ID_AQUI', 'local');

// Si se pasan argumentos por línea de comandos
const args = process.argv.slice(2);
if (args.length === 2) {
  const [orderId, paymentMethod] = args;
  console.log(`🚀 Ejecutando con argumentos: ${orderId}, ${paymentMethod}\n`);
  updatePaymentMethod(orderId, paymentMethod);
} else {
  console.log('📖 USO:');
  console.log('   node update-payment-method.js [PEDIDO_ID] [online|local]');
  console.log('\n📝 EJEMPLO:');
  console.log('   node update-payment-method.js 507f1f77bcf86cd799439011 local');
  console.log('\n💡 O edita el script y descomenta la línea de ejemplo');
}
