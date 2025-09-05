import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import { sendOrderStatusUpdate } from './services/emailService.js';
import { decrypt } from './config/encryption.js';

dotenv.config();

console.log('🔍 ANÁLISIS DE EMAILS EN ÓRDENES REALES\n');

async function debugRealOrderEmails() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener las últimas 3 órdenes
    console.log('📋 Obteniendo últimas 3 órdenes...');
    const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
    
    if (orders.length === 0) {
      console.log('❌ No se encontraron órdenes en la base de datos');
      return;
    }

    console.log(`📊 Analizando ${orders.length} órdenes:\n`);

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      console.log(`🔍 ORDEN ${i + 1}:`);
      console.log(`   ID: ${order._id}`);
      console.log(`   Estado: ${order.status}`);
      console.log(`   Cliente: ${order.customerName}`);
      console.log(`   Fecha: ${order.createdAt}`);
      
      // Analizar customerEmail
      console.log(`\n   📧 ANÁLISIS DEL EMAIL:`);
      console.log(`   customerEmail raw:`, order.customerEmail);
      console.log(`   Tipo:`, typeof order.customerEmail);
      
      if (order.customerEmail) {
        let emailToSend = order.customerEmail;
        
        if (typeof emailToSend === 'object' && emailToSend !== null && emailToSend.iv && emailToSend.data) {
          console.log(`   ✅ Email está encriptado como objeto`);
          try {
            emailToSend = decrypt(emailToSend);
            console.log(`   🔓 Email desencriptado: ${emailToSend}`);
            
            // Probar envío de email
            console.log(`   📧 Probando envío de email...`);
            try {
              await sendOrderStatusUpdate(order, emailToSend);
              console.log(`   ✅ Email enviado exitosamente a: ${emailToSend}`);
            } catch (emailError) {
              console.log(`   ❌ Error enviando email: ${emailError.message}`);
            }
            
          } catch (decryptError) {
            console.log(`   ❌ Error desencriptando: ${decryptError.message}`);
          }
        } else if (typeof emailToSend === 'string') {
          if (emailToSend.includes('@')) {
            console.log(`   ✅ Email en texto plano: ${emailToSend}`);
            
            // Probar envío de email
            console.log(`   📧 Probando envío de email...`);
            try {
              await sendOrderStatusUpdate(order, emailToSend);
              console.log(`   ✅ Email enviado exitosamente a: ${emailToSend}`);
            } catch (emailError) {
              console.log(`   ❌ Error enviando email: ${emailError.message}`);
            }
          } else {
            console.log(`   ⚠️ String sin @ - posible encriptación como string`);
          }
        } else {
          console.log(`   ❌ Tipo de email no reconocido`);
        }
      } else {
        console.log(`   ❌ customerEmail es null/undefined`);
      }
      
      console.log(`\n${'='.repeat(60)}\n`);
    }

    await mongoose.disconnect();
    console.log('✅ Análisis completado');

  } catch (error) {
    console.error('❌ Error en análisis:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error desconectando:', disconnectError);
    }
  }
}

// Ejecutar análisis
debugRealOrderEmails();
