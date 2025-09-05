@echo off
echo Creando archivo .env con configuracion correcta para beniken_db...

echo MONGODB_URI=mongodb://localhost:27017/beniken_db> .env
echo PORT=5000>> .env
echo NODE_ENV=development>> .env
echo JWT_SECRET=beniken-jwt-secret-2024>> .env
echo CLIENT_URL=http://localhost:3001,http://localhost:3000>> .env

echo ✅ Archivo .env creado correctamente
echo 📦 Base de datos: beniken_db
echo 📡 Puerto: 5000
echo.
pause
