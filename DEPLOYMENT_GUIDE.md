# Guía de Deployment - Beniken Pedidos

## Archivos Esenciales para GitHub y Render

### ✅ MANTENER - Archivos de Producción

#### **Backend (Esenciales)**
```
backend/
├── controllers/          # Lógica de negocio
├── middleware/          # Autenticación y validación
├── models/             # Esquemas de MongoDB
├── routes/             # Endpoints de API
├── utils/              # Utilidades
├── server.js           # Servidor principal
├── package.json        # Dependencias
└── .env.example        # Template de variables
```

#### **Frontend (Esenciales)**
```
frontend/
├── public/             # Archivos estáticos
├── src/
│   ├── components/     # Componentes React
│   ├── context/        # Context providers
│   ├── api/           # Llamadas a API
│   ├── utils/         # Utilidades
│   ├── App.js         # Componente principal
│   └── index.js       # Entry point
├── package.json        # Dependencias
├── tailwind.config.js  # Configuración CSS
└── .env.example        # Template de variables
```

#### **Configuración de Deployment**
```
├── render.yaml         # Configuración de Render
├── package.json        # Scripts del proyecto
├── .gitignore         # Archivos ignorados
└── README.md          # Documentación
```

### ❌ ELIMINAR - Archivos de Desarrollo/Testing

#### **Scripts de Desarrollo (No necesarios en producción)**
```
├── scripts/            # Scripts de testing
├── tests/              # Tests E2E y unitarios
├── playwright-report/  # Reportes de tests
├── test-results/       # Resultados de tests
├── playwright.config.js
├── start-backend.bat   # Scripts locales
├── fix-frontend-api.bat
├── test-api.js
└── users.txt
```

#### **Archivos Temporales Backend**
```
backend/
├── create-env.bat      # Script temporal
├── start-dev.js        # Desarrollo con Memory Server
├── start-local.js      # Desarrollo local
├── start-simple.js     # Test simple
├── test-*.js          # Scripts de testing
├── debug-test.js      # Debug temporal
├── jest.config.*      # Configuración Jest
├── tests/             # Tests unitarios
└── uploads/           # Archivos subidos (temporal)
```

#### **Archivos Temporales Frontend**
```
frontend/
├── fix-frontend.bat    # Script temporal
├── fix-webpack.js      # Fix temporal
├── start-frontend.js   # Script desarrollo
└── build/             # Build local (se regenera)
```

#### **Documentación de Desarrollo**
```
├── BACKEND_SETUP_GUIDE.md
├── COMPLETE_TESTING_GUIDE.md
├── CURRENT_STATUS.md
├── FINAL_TEST_STATUS.md
├── QUICK_START.md
├── TESTING.md
└── TEST_STATUS.md
```

## Configuración para Render

### Variables de Entorno Requeridas

#### **Backend Service**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/beniken_db
JWT_SECRET=production-jwt-secret-here
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.onrender.com
```

#### **Frontend Service**
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
```

### Render.yaml Optimizado
```yaml
services:
  - type: web
    name: beniken-backend
    env: node
    buildCommand: cd backend && npm install --production
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
        
  - type: web
    name: beniken-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
```

## Limpieza Recomendada para GitHub

### Comando de Limpieza
```bash
# Eliminar archivos de desarrollo
rm -rf scripts/ tests/ playwright-report/ test-results/
rm *.bat test-api.js users.txt playwright.config.js
rm backend/start-*.js backend/test-*.js backend/debug-*.js
rm backend/jest.config.* backend/create-env.bat
rm frontend/fix-*.* frontend/start-frontend.js
rm *_GUIDE.md *_STATUS.md TESTING.md QUICK_START.md
```

### Mantener Solo
```
├── backend/ (solo archivos esenciales)
├── frontend/ (solo archivos esenciales)
├── .github/workflows/
├── render.yaml
├── package.json
├── .gitignore
└── README.md
```

## Configuración de Base de Datos

### Para Desarrollo Local
```env
MONGODB_URI=mongodb://localhost:27017/beniken_db
```

### Para Producción (Render)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beniken_db
```

## Pasos para Deployment

1. **Limpiar archivos de desarrollo**
2. **Configurar variables de entorno en Render**
3. **Conectar repositorio GitHub a Render**
4. **Configurar MongoDB Atlas para producción**
5. **Deploy automático desde GitHub**

## Estado Actual del Proyecto
- ✅ Backend funcional con rutas API completas
- ✅ Frontend con UI completa y funcional
- ✅ Configuración de CORS y autenticación
- ✅ Sistema de pedidos, productos y usuarios
- ✅ Panel administrativo con reportes
- ✅ Sistema de notificaciones en tiempo real
- ⚠️ Requiere limpieza para deployment en producción
