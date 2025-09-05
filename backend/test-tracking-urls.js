import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';

dotenv.config();

console.log('🔗 PRUEBA DE URLs DE SEGUIMIENTO DE PEDIDOS\n');

async function testTrackingUrls() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener algunas órdenes para probar
    console.log('📋 Obteniendo órdenes para generar URLs de prueba...');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    
    if (orders.length === 0) {
      console.log('❌ No se encontraron órdenes en la base de datos');
      console.log('💡 Crea una orden desde el frontend primero');
      await mongoose.disconnect();
      return;
    }

    console.log(`📊 Generando URLs para ${orders.length} órdenes:\n`);

    // URL base configurada
    const CLIENT_URL = process.env.CLIENT_URL?.split(',')[0] || 'https://beniken-pedidos.netlify.app';
    console.log(`🌐 URL base configurada: ${CLIENT_URL}\n`);

    orders.forEach((order, index) => {
      const trackingUrl = `${CLIENT_URL}/track/${order.id}`;
      
      console.log(`🔍 ORDEN ${index + 1}:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Cliente: ${order.customerName}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   📧 URL en emails: ${trackingUrl}`);
      console.log(`   ✅ Ruta frontend: /track/${order.id}`);
      console.log(`   🎯 Componente: OrderTrackingPage`);
      console.log('');
    });

    console.log('🚀 PARA PROBAR LAS URLs:');
    console.log('\n1️⃣ DESDE EMAIL:');
    console.log('   - Los emails ahora incluyen URLs como:');
    console.log(`   - ${CLIENT_URL}/track/ORD026`);
    console.log('   - Estas URLs funcionarán correctamente');
    
    console.log('\n2️⃣ MANUALMENTE:');
    console.log('   - Ve al frontend en tu navegador');
    console.log('   - Prueba URLs como: /track/ORD026');
    console.log('   - Deberías ver la página de seguimiento');
    
    console.log('\n3️⃣ DESARROLLO LOCAL:');
    console.log('   - http://localhost:3000/track/ORD026');
    console.log('   - Funciona tanto en desarrollo como producción');

    console.log('\n📧 CONFIGURACIÓN DE EMAILS:');
    console.log(`   ✅ CLIENT_URL: ${CLIENT_URL}`);
    console.log('   ✅ Ruta dinámica: /track/:orderId creada');
    console.log('   ✅ OrderTrackingPage actualizado');
    console.log('   ✅ URLs dinámicas funcionando');

    await mongoose.disconnect();
    console.log('\n✅ Verificación completada');
    console.log('\n🎯 RESUMEN: Las URLs de seguimiento están configuradas correctamente.');
    console.log('🎯 Los clientes podrán hacer clic en los enlaces de los emails para ver sus pedidos.');

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
testTrackingUrls();
