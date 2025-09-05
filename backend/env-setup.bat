@echo off
echo 🔧 Configurando archivo .env para emails...
echo.

REM Crear archivo .env basado en .env.example
copy .env.example .env

echo ✅ Archivo .env creado desde .env.example
echo.
echo 📝 IMPORTANTE: Debes editar el archivo .env y configurar:
echo.
echo 1. SENDGRID_API_KEY=tu_clave_api_de_sendgrid
echo 2. MAIL_FROM=tu_email_verificado@tudominio.com
echo.
echo 📋 Pasos para obtener SendGrid API Key:
echo 1. Crear cuenta en https://sendgrid.com
echo 2. Ir a Settings ^> API Keys
echo 3. Crear nueva API Key con permisos "Mail Send"
echo 4. Copiar la clave y pegarla en .env
echo.
echo 🔍 Para probar emails después de configurar:
echo    node email-diagnosis.js
echo    node test-email.js
echo.
pause
