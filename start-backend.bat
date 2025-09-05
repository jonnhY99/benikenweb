@echo off
echo 🚀 Iniciando servidor backend de Beniken...
echo.

cd /d "%~dp0backend"

echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️  Instalando dependencias...
    npm install
)

echo 🔧 Configurando variables de entorno...
if not exist ".env" (
    echo Creando archivo .env desde .env.example...
    copy .env.example .env
)

echo 🚀 Iniciando servidor con MongoDB local (beniken_db)...
echo ℹ️  El servidor estará disponible en: http://localhost:5000
echo ℹ️  Health check: http://localhost:5000/api/health
echo ℹ️  API Products: http://localhost:5000/api/products
echo ℹ️  API Orders: http://localhost:5000/api/orders
echo.
echo ⚠️  Presiona Ctrl+C para detener el servidor
echo.

node start-local.js

pause
