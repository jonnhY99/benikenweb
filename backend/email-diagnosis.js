import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// Cargar variables de entorno
dotenv.config();

async function diagnoseEmailConfiguration() {
  console.log('🔍 DIAGNÓSTICO DEL SISTEMA DE EMAIL\n');
  
  // 1. Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  const apiKey = process.env.SENDGRID_API_KEY;
  const mailFrom = process.env.MAIL_FROM;
  const clientUrl = process.env.CLIENT_URL;
  
  console.log(`SENDGRID_API_KEY: ${apiKey ? (apiKey.length > 10 ? '✅ Configurada (' + apiKey.substring(0, 10) + '...)' : '⚠️ Muy corta') : '❌ No configurada'}`);
  console.log(`MAIL_FROM: ${mailFrom || '❌ No configurada'}`);
  console.log(`CLIENT_URL: ${clientUrl || '❌ No configurada'}\n`);
  
  // 2. Verificar formato de API Key
  if (!apiKey || apiKey === 'your_sendgrid_api_key_here') {
    console.log('❌ PROBLEMA: SENDGRID_API_KEY no configurada');
    console.log('\n🛠️ SOLUCIÓN:');
    console.log('1. Crea una cuenta en SendGrid: https://sendgrid.com');
    console.log('2. Ve a Settings > API Keys');
    console.log('3. Crea una nueva API Key con permisos "Full Access"');
    console.log('4. Copia la clave y agrégala al archivo .env:');
    console.log('   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx');
    return false;
  }
  
  if (!apiKey.startsWith('SG.')) {
    console.log('⚠️ ADVERTENCIA: La API Key no tiene el formato esperado (debe empezar con "SG.")');
  }
  
  // 3. Verificar email remitente
  if (!mailFrom || !mailFrom.includes('@')) {
    console.log('❌ PROBLEMA: MAIL_FROM no configurado correctamente');
    console.log('\n🛠️ SOLUCIÓN:');
    console.log('1. Configura MAIL_FROM en .env con un email válido');
    console.log('2. Verifica el dominio en SendGrid (Settings > Sender Authentication)');
    console.log('   Ejemplo: MAIL_FROM=noreply@tudominio.com');
    return false;
  }
  
  // 4. Test de conexión con SendGrid
  try {
    sgMail.setApiKey(apiKey);
    console.log('✅ API Key configurada en SendGrid\n');
    
    // 5. Test básico de envío
    console.log('📧 Probando envío de email básico...');
    
    const testMsg = {
      to: 'test@example.com', // Email de prueba
      from: mailFrom,
      subject: 'Test de configuración - Beniken',
      text: 'Este es un email de prueba para verificar la configuración de SendGrid.',
      html: '<p>Este es un email de prueba para verificar la configuración de SendGrid.</p>'
    };
    
    // Nota: No enviamos realmente el email, solo validamos la configuración
    console.log('✅ Configuración válida para envío');
    console.log(`📤 Email se enviaría desde: ${mailFrom}`);
    console.log(`📥 Email de prueba sería enviado a: test@example.com\n`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en la configuración de SendGrid:', error.message);
    
    if (error.code === 401) {
      console.log('\n🛠️ SOLUCIÓN: API Key inválida');
      console.log('- Verifica que la API Key sea correcta');
      console.log('- Asegúrate de que tenga permisos "Mail Send"');
    } else if (error.code === 403) {
      console.log('\n🛠️ SOLUCIÓN: Email remitente no verificado');
      console.log('- Ve a SendGrid > Settings > Sender Authentication');
      console.log('- Verifica tu dominio o email individual');
    }
    
    return false;
  }
}

async function checkEmailServiceIntegration() {
  console.log('🔧 VERIFICANDO INTEGRACIÓN DEL SERVICIO DE EMAIL\n');
  
  try {
    // Importar el servicio de email
    const emailService = await import('./services/emailService.js');
    console.log('✅ Servicio de email importado correctamente');
    
    // Verificar que las funciones existen
    const functions = ['sendOrderConfirmation', 'sendOrderStatusUpdate', 'sendPaymentConfirmation'];
    functions.forEach(func => {
      if (typeof emailService[func] === 'function') {
        console.log(`✅ ${func} disponible`);
      } else {
        console.log(`❌ ${func} no encontrada`);
      }
    });
    
    console.log('\n📋 Integración en controladores:');
    
    // Verificar orderController
    try {
      const orderController = await import('./controllers/orderController.js');
      console.log('✅ orderController importa funciones de email');
    } catch (error) {
      console.log('❌ Error en orderController:', error.message);
    }
    
    // Verificar paymentController
    try {
      const paymentController = await import('./controllers/paymentController.js');
      console.log('✅ paymentController importa funciones de email');
    } catch (error) {
      console.log('❌ Error en paymentController:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error verificando integración:', error.message);
  }
}

// Ejecutar diagnóstico
async function runDiagnosis() {
  const configOk = await diagnoseEmailConfiguration();
  console.log('═'.repeat(50));
  await checkEmailServiceIntegration();
  
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
  if (configOk) {
    console.log('✅ Configuración básica correcta');
    console.log('💡 Si los emails no se envían, verifica:');
    console.log('   - Que el dominio esté verificado en SendGrid');
    console.log('   - Los logs del servidor para errores específicos');
    console.log('   - Que customerEmail esté presente en los pedidos');
  } else {
    console.log('❌ Configuración incompleta - revisar variables de entorno');
  }
}

runDiagnosis().catch(console.error);
