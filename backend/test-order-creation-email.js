import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import { sendOrderConfirmation } from './services/emailService.js';
import { encrypt, decrypt } from './config/encryption.js';

dotenv.config();

console.log('🧪 PRUEBA DE CREACIÓN DE ORDEN Y ENVÍO DE EMAIL\n');

async function testOrderCreationWithEmail() {
  try {
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Datos de prueba
    const testEmail = 'axelfolymaldonadodz@gmail.com'; // Email que sabemos que funciona
    const testOrderData = {
      customerName: 'Cliente Prueba Email',
      customerPhone: '+56912345678',
      customerEmail: testEmail,
      items: [
        { name: 'Producto Test', price: 5000, quantity: 2 }
      ],
      total: 10000,
      status: 'Pendiente',
      orderNumber: `TEST-${Date.now()}`,
      note: 'Prueba de notificación por email'
    };

    console.log('📝 Datos de la orden de prueba:');
    console.log(JSON.stringify(testOrderData, null, 2));

    // Simular el proceso del controlador
    console.log('\n🔄 Simulando proceso de createOrder...\n');

    // 1. Crear la orden
    console.log('1️⃣ Creando orden en base de datos...');
    const newOrder = new Order(testOrderData);
    await newOrder.save();
    console.log('✅ Orden creada con ID:', newOrder._id);

    // 2. Procesar email como en el controlador
    console.log('\n2️⃣ Procesando email para notificación...');
    
    const customerEmailToUse = testOrderData.customerEmail;
    console.log('🔍 Email a procesar:', customerEmailToUse);
    console.log('🔍 Tipo:', typeof customerEmailToUse);

    if (customerEmailToUse) {
      let emailToSend = customerEmailToUse;
      
      // Verificar si está encriptado
      if (typeof emailToSend === 'object' && emailToSend !== null && emailToSend.iv && emailToSend.data) {
        console.log('🔓 Email está encriptado, desencriptando...');
        try {
          emailToSend = decrypt(emailToSend);
          console.log('✅ Email desencriptado:', emailToSend);
        } catch (decryptError) {
          console.error('❌ Error desencriptando:', decryptError);
          throw decryptError;
        }
      } else if (typeof emailToSend === 'string') {
        if (emailToSend.includes('@')) {
          console.log('✅ Email en texto plano válido:', emailToSend);
        } else {
          console.log('⚠️ Email string sin @, intentando desencriptar...');
          try {
            emailToSend = decrypt(emailToSend);
            console.log('✅ Email string desencriptado:', emailToSend);
          } catch (decryptError) {
            console.log('⚠️ No se pudo desencriptar, usando como texto plano');
          }
        }
      }

      // 3. Enviar email
      console.log('\n3️⃣ Enviando email de confirmación...');
      console.log('📧 Destinatario:', emailToSend);
      console.log('📧 Orden:', newOrder.orderNumber);

      try {
        await sendOrderConfirmation(newOrder, emailToSend);
        console.log('✅ Email enviado exitosamente!');
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
        throw emailError;
      }
    }

    // 4. Limpiar orden de prueba
    console.log('\n4️⃣ Limpiando orden de prueba...');
    await Order.deleteOne({ _id: newOrder._id });
    console.log('✅ Orden de prueba eliminada');

    await mongoose.disconnect();
    console.log('\n✅ Prueba completada exitosamente');
    console.log('📧 Revisa tu bandeja de entrada en:', testEmail);

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
testOrderCreationWithEmail();
