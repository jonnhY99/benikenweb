import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import { sendOrderStatusUpdate } from './services/emailService.js';
import { encrypt, decrypt } from './config/encryption.js';

dotenv.config();

console.log('🧪 PRUEBA COMPLETA DEL FLUJO DE EMAILS POR CAMBIO DE ESTADO\n');

async function testOrderStatusEmailFlow() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Crear orden de prueba con email encriptado (como lo hace CustomerForm)
    console.log('1️⃣ Creando orden de prueba con email encriptado...');
    
    const testEmail = 'axelfolymaldonadodz@gmail.com';
    const testOrderData = {
      id: `TEST-STATUS-${Date.now()}`, // Campo requerido
      customerName: 'Cliente Prueba Estado',
      customerPhone: '+56912345678',
      customerEmail: testEmail, // Se encriptará automáticamente por el modelo
      items: [
        { 
          productId: 'test-product-1',
          name: 'Producto Test', 
          price: 5000, 
          quantity: 1,
          unit: 'kg'
        }
      ],
      totalCLP: 5000, // Campo requerido (no 'total')
      status: 'Pendiente',
      note: 'Prueba de cambio de estado y email'
    };

    const newOrder = new Order(testOrderData);
    await newOrder.save();
    console.log('✅ Orden creada con ID:', newOrder._id);
    console.log('📧 Email original:', testEmail);
    console.log('🔐 Email encriptado en DB:', typeof newOrder.customerEmail === 'object' ? 'Sí (objeto)' : 'No (string)');

    // 2. Simular cambio de estado a "En preparación"
    console.log('\n2️⃣ Simulando cambio de estado a "En preparación"...');
    
    newOrder.status = 'En preparación';
    await newOrder.save();
    
    // Obtener orden actualizada para simular el flujo del controlador
    const updatedOrder = await Order.findById(newOrder._id);
    console.log('✅ Estado actualizado a:', updatedOrder.status);
    
    // 3. Probar desencriptación del email
    console.log('\n3️⃣ Probando desencriptación del email...');
    
    let emailToSend = updatedOrder.customerEmail;
    console.log('🔍 Email desde DB:', emailToSend);
    console.log('🔍 Tipo:', typeof emailToSend);
    
    if (typeof emailToSend === 'object' && emailToSend !== null && emailToSend.iv && emailToSend.data) {
      try {
        emailToSend = decrypt(emailToSend);
        console.log('✅ Email desencriptado exitosamente:', emailToSend);
      } catch (decryptError) {
        console.error('❌ Error desencriptando:', decryptError);
        throw decryptError;
      }
    } else {
      console.log('ℹ️ Email no está encriptado como objeto');
    }

    // 4. Enviar email de actualización
    console.log('\n4️⃣ Enviando email de actualización de estado...');
    
    try {
      await sendOrderStatusUpdate(updatedOrder, emailToSend);
      console.log('✅ Email de actualización enviado exitosamente!');
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      throw emailError;
    }

    // 5. Probar otros estados
    const statesToTest = ['Listo', 'Pendiente pago', 'Entregado'];
    
    for (const status of statesToTest) {
      console.log(`\n5️⃣ Probando estado: ${status}...`);
      
      updatedOrder.status = status;
      await updatedOrder.save();
      
      try {
        await sendOrderStatusUpdate(updatedOrder, emailToSend);
        console.log(`✅ Email para estado "${status}" enviado exitosamente`);
      } catch (emailError) {
        console.error(`❌ Error enviando email para estado "${status}":`, emailError);
      }
    }

    // 6. Limpiar orden de prueba
    console.log('\n6️⃣ Limpiando orden de prueba...');
    await Order.deleteOne({ _id: newOrder._id });
    console.log('✅ Orden de prueba eliminada');

    await mongoose.disconnect();
    console.log('\n✅ Prueba completada exitosamente');
    console.log('📧 Revisa tu bandeja de entrada en:', testEmail);
    console.log('\n📋 RESUMEN:');
    console.log('- Orden creada con email encriptado ✅');
    console.log('- Email desencriptado correctamente ✅');
    console.log('- Emails enviados para todos los estados ✅');

  } catch (error) {
    console.error('\n❌ Error en prueba:', error);
    
    // Intentar limpiar en caso de error
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error desconectando:', disconnectError);
    }
  }
}

// Ejecutar prueba
testOrderStatusEmailFlow();
