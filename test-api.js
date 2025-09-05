// test-api.js - Script para probar los endpoints de la API
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Probando endpoints de la API...\n');
  
  const endpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Products', url: '/api/products' },
    { name: 'Orders', url: '/api/orders' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Probando ${endpoint.name}: ${BASE_URL}${endpoint.url}`);
      
      const response = await fetch(`${BASE_URL}${endpoint.url}`);
      const status = response.status;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: ${status} - OK`);
        console.log(`   Respuesta:`, JSON.stringify(data, null, 2).substring(0, 100) + '...\n');
      } else {
        console.log(`❌ ${endpoint.name}: ${status} - Error`);
        const text = await response.text();
        console.log(`   Error:`, text.substring(0, 100) + '...\n');
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error de conexión`);
      console.log(`   Error:`, error.message + '\n');
    }
  }
}

testAPI();
