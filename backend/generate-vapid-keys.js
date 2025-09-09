// generate-vapid-keys.js - Generar claves VAPID para notificaciones push
import webpush from 'web-push';

console.log('🔑 Generando claves VAPID para notificaciones push...\n');

try {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('✅ Claves VAPID generadas exitosamente:\n');
  console.log('📋 Copia estas claves a tu archivo .env:\n');
  console.log('VAPID_PUBLIC_KEY="' + vapidKeys.publicKey + '"');
  console.log('VAPID_PRIVATE_KEY="' + vapidKeys.privateKey + '"');
  console.log('VAPID_SUBJECT="mailto:beniken382carnes@gmail.com"');
  console.log('\n📝 También actualiza el frontend con la clave pública:');
  console.log('REACT_APP_VAPID_PUBLIC_KEY="' + vapidKeys.publicKey + '"');
  console.log('\n⚠️  IMPORTANTE: Guarda estas claves de forma segura.');
  console.log('   Si las pierdes, tendrás que regenerar y reconfigurar todas las suscripciones.');
  
} catch (error) {
  console.error('❌ Error generando claves VAPID:', error);
  process.exit(1);
}
