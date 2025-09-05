import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import { encrypt, decrypt, hashValue } from './config/encryption.js';

dotenv.config();

console.log('🔍 ANÁLISIS DE CAPTURA Y PROCESAMIENTO DE EMAILS\n');

async function debugEmailCapture() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener las últimas 5 órdenes para analizar
    console.log('📋 Obteniendo últimas 5 órdenes...');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    if (orders.length === 0) {
      console.log('❌ No se encontraron órdenes en la base de datos');
      return;
    }

    console.log(`📊 Analizando ${orders.length} órdenes:\n`);

    orders.forEach((order, index) => {
      console.log(`🔍 ORDEN ${index + 1}:`);
      console.log(`   ID: ${order._id}`);
      console.log(`   Número: ${order.orderNumber || 'N/A'}`);
      console.log(`   Fecha: ${order.createdAt}`);
      console.log(`   Estado: ${order.status}`);
      
      // Analizar customerEmail
      console.log(`\n   📧 ANÁLISIS DEL EMAIL:`);
      console.log(`   customerEmail raw:`, order.customerEmail);
      console.log(`   Tipo:`, typeof order.customerEmail);
      
      if (order.customerEmail) {
        if (typeof order.customerEmail === 'string') {
          console.log(`   ✅ Es string`);
          if (order.customerEmail.includes('@')) {
            console.log(`   ✅ Contiene @ - parece email válido`);
            console.log(`   📧 Email: ${order.customerEmail}`);
          } else {
            console.log(`   ⚠️ No contiene @ - podría estar encriptado como string`);
            console.log(`   🔍 Intentando desencriptar...`);
            try {
              // Intentar desencriptar si es string encriptado
              const decrypted = decrypt(order.customerEmail);
              console.log(`   ✅ Desencriptado exitosamente: ${decrypted}`);
            } catch (error) {
              console.log(`   ❌ No se pudo desencriptar: ${error.message}`);
            }
          }
        } else if (typeof order.customerEmail === 'object') {
          console.log(`   ✅ Es objeto - probablemente encriptado`);
          console.log(`   🔑 Propiedades:`, Object.keys(order.customerEmail));
          
          if (order.customerEmail.iv && order.customerEmail.data) {
            console.log(`   ✅ Tiene estructura de encriptación (iv, data)`);
            try {
              const decrypted = decrypt(order.customerEmail);
              console.log(`   ✅ Desencriptado exitosamente: ${decrypted}`);
            } catch (error) {
              console.log(`   ❌ Error desencriptando: ${error.message}`);
            }
          } else {
            console.log(`   ⚠️ Objeto sin estructura de encriptación esperada`);
          }
        } else {
          console.log(`   ❌ Tipo inesperado: ${typeof order.customerEmail}`);
        }
      } else {
        console.log(`   ❌ customerEmail es null/undefined`);
      }

      // Analizar otros campos del cliente
      console.log(`\n   👤 OTROS DATOS DEL CLIENTE:`);
      console.log(`   customerName:`, order.customerName, `(tipo: ${typeof order.customerName})`);
      console.log(`   customerPhone:`, order.customerPhone, `(tipo: ${typeof order.customerPhone})`);
      
      console.log(`\n${'='.repeat(60)}\n`);
    });

    // Simular creación de orden con email en texto plano
    console.log('🧪 SIMULANDO CREACIÓN DE ORDEN CON EMAIL EN TEXTO PLANO:\n');
    
    const testEmail = 'test@example.com';
    const testOrder = {
      customerName: 'Cliente Prueba',
      customerPhone: '+56912345678',
      customerEmail: testEmail,
      items: [{ name: 'Producto Test', price: 1000, quantity: 1 }],
      total: 1000,
      status: 'Pendiente'
    };

    console.log('📝 Datos de prueba a enviar:');
    console.log('   customerEmail:', testEmail);
    console.log('   Tipo:', typeof testEmail);
    console.log('   Contiene @:', testEmail.includes('@'));

    // Simular lo que hace el frontend
    console.log('\n🔄 Simulando envío desde frontend...');
    console.log('   Payload que se enviaría:', JSON.stringify(testOrder, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');

  } catch (error) {
    console.error('❌ Error en análisis:', error);
  }
}

debugEmailCapture();
