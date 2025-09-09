import webpush from 'web-push';

console.log('🔑 Generando claves VAPID reales...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Claves VAPID generadas:\n');
console.log('📋 BACKEND (.env):');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('VAPID_SUBJECT="mailto:beniken382carnes@gmail.com"');
console.log('\n📋 FRONTEND (.env):');
console.log(`REACT_APP_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log('\n📏 Longitud de clave pública:', vapidKeys.publicKey.length, 'caracteres');
