@echo off
echo 🔧 Corrigiendo configuración de API del frontend...

cd /d "%~dp0frontend"

echo REACT_APP_API_URL=http://localhost:5000> .env
echo REACT_APP_SOCKET_URL=http://localhost:5000>> .env
echo BROWSER=none>> .env
echo GENERATE_SOURCEMAP=false>> .env

echo ✅ Archivo .env creado con configuración correcta
echo 🔄 Reinicia el frontend para aplicar los cambios
echo.
echo Variables configuradas:
echo   REACT_APP_API_URL=http://localhost:5000
echo   REACT_APP_SOCKET_URL=http://localhost:5000
echo.
echo 📡 Ahora las rutas serán:
echo   http://localhost:5000/api/products ✅
echo   http://localhost:5000/api/orders ✅
echo.
pause
