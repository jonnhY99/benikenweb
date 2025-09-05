import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import sgMail from '@sendgrid/mail';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuración inicial
console.log('Iniciando prueba de envío...');
console.log('API Key:', process.env.SENDGRID_API_KEY ? 'Configurada' : 'No configurada');

// Configuración directa
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Envío de correo
const msg = {
  to: 'beniken382carnes@gmail.com', // Cambia esto
  from: process.env.MAIL_FROM,
  subject: 'Prueba directa de SendGrid',
  text: 'Esto es una prueba directa',
  html: '<strong>Esto es una prueba directa</strong>'
};

sgMail
  .send(msg)
  .then(() => console.log('✅ Correo enviado exitosamente!'))
  .catch(error => {
    console.error('❌ Error al enviar el correo:');
    console.error('Código:', error.code);
    if (error.response) {
      console.error('Detalles:', error.response.body);
    }
  });