const webpush = require('web-push');

console.log('🔑 Generando claves VAPID válidas...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Claves VAPID generadas exitosamente:\n');
console.log('📋 BACKEND (.env):');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('VAPID_SUBJECT="mailto:beniken382carnes@gmail.com"');
console.log('\n📋 FRONTEND (.env):');
console.log(`REACT_APP_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log('\n📏 Información:');
console.log('- Longitud clave pública:', vapidKeys.publicKey.length, 'caracteres');
console.log('- Formato: Base64URL válido');
console.log('\n⚠️  IMPORTANTE: Copia estas claves exactamente como aparecen (con comillas)');
