# Limpieza para Producción - Beniken Pedidos

## Archivos a ELIMINAR antes del deployment

### Scripts de Testing y Desarrollo
```bash
# Eliminar carpetas completas
rm -rf scripts/
rm -rf tests/
rm -rf playwright-report/
rm -rf test-results/
rm -rf .qodo/

# Archivos de testing en raíz
rm playwright.config.js
rm test-api.js
rm users.txt

# Documentación de desarrollo
rm BACKEND_SETUP_GUIDE.md
rm COMPLETE_TESTING_GUIDE.md
rm CURRENT_STATUS.md
rm FINAL_TEST_STATUS.md
rm QUICK_START.md
rm TESTING.md
rm TEST_STATUS.md
rm DEPLOYMENT_GUIDE.md
rm PRODUCTION_CLEANUP.md

# Scripts de desarrollo
rm start-backend.bat
rm fix-frontend-api.bat
```

### Backend - Archivos Temporales
```bash
cd backend/
rm create-env.bat
rm start-dev.js
rm start-local.js
rm start-simple.js
rm test-server.js
rm debug-test.js
rm jest.config.cjs
rm jest.config.js
rm simple-check.js
rm test-runner-native.js
rm test-runner.js
rm test-single.js
rm -rf tests/
rm -rf uploads/
```

### Frontend - Archivos Temporales
```bash
cd frontend/
rm fix-frontend.bat
rm fix-webpack.js
rm start-frontend.js
rm -rf build/  # Se regenera en deployment
```

## Estructura FINAL para GitHub/Render

```
beniken_pedidos/
├── .github/
│   └── workflows/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── .gitignore
├── package.json
├── render.yaml
└── README.md
```

## Variables de Entorno para Render

### Backend Environment Variables
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beniken_db
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
CLIENT_URL=https://beniken-frontend.onrender.com
PORT=5000
```

### Frontend Environment Variables
```
REACT_APP_API_URL=https://beniken-backend.onrender.com
REACT_APP_SOCKET_URL=https://beniken-backend.onrender.com
```

## Optimización del .gitignore

Agregar estas líneas para excluir archivos de desarrollo:
```
# Development scripts
*.bat
start-*.js
test-*.js
debug-*.js
fix-*.js

# Testing
jest.config.*
playwright.config.js
test-results/
playwright-report/
tests/
scripts/

# Documentation
*_GUIDE.md
*_STATUS.md
TESTING.md
DEPLOYMENT_GUIDE.md
PRODUCTION_CLEANUP.md

# Temporary files
users.txt
test-api.js
```

## Comandos de Limpieza Rápida

### Windows (PowerShell)
```powershell
# Eliminar archivos de testing
Remove-Item -Recurse -Force scripts, tests, playwright-report, test-results, .qodo -ErrorAction SilentlyContinue

# Eliminar documentación de desarrollo
Remove-Item *_GUIDE.md, *_STATUS.md, TESTING.md, DEPLOYMENT_GUIDE.md, PRODUCTION_CLEANUP.md -ErrorAction SilentlyContinue

# Eliminar scripts temporales
Remove-Item *.bat, test-api.js, users.txt, playwright.config.js -ErrorAction SilentlyContinue

# Backend cleanup
Remove-Item backend/start-*.js, backend/test-*.js, backend/debug-*.js, backend/jest.config.*, backend/create-env.bat -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend/tests, backend/uploads -ErrorAction SilentlyContinue

# Frontend cleanup
Remove-Item frontend/fix-*.*, frontend/start-frontend.js -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend/build -ErrorAction SilentlyContinue
```

### Linux/Mac
```bash
# Eliminar archivos de testing
rm -rf scripts/ tests/ playwright-report/ test-results/ .qodo/

# Eliminar documentación de desarrollo
rm *_GUIDE.md *_STATUS.md TESTING.md DEPLOYMENT_GUIDE.md PRODUCTION_CLEANUP.md

# Eliminar scripts temporales
rm *.bat test-api.js users.txt playwright.config.js

# Backend cleanup
rm backend/start-*.js backend/test-*.js backend/debug-*.js backend/jest.config.* backend/create-env.bat
rm -rf backend/tests/ backend/uploads/

# Frontend cleanup
rm frontend/fix-*.* frontend/start-frontend.js
rm -rf frontend/build/
```

## Verificación Pre-Deployment

1. **Estructura limpia** ✓
2. **Variables de entorno configuradas** ✓
3. **MongoDB Atlas configurado** (requerido)
4. **render.yaml válido** ✓
5. **package.json optimizado** ✓

## Base de Datos para Producción

### MongoDB Atlas Setup
1. Crear cluster en MongoDB Atlas
2. Configurar usuario y contraseña
3. Obtener connection string
4. Actualizar `MONGODB_URI` en Render con:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/beniken_db
   ```

### Migración de Datos
Si necesitas migrar datos de local a Atlas:
```bash
mongodump --db beniken_db
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/beniken_db" dump/beniken_db/
```
