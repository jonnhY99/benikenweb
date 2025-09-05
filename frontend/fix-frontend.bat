@echo off
echo 🔧 Solucionando problemas del frontend...

echo 🧹 Limpiando cache y dependencias...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force

echo 📦 Reinstalando dependencias...
npm install

echo 🚀 Iniciando frontend en puerto 3001...
set PORT=3001
npm start
