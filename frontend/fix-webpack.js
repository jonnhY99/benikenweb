#!/usr/bin/env node

// Script para solucionar error de Html Webpack Plugin
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando error de Html Webpack Plugin...');

// Función para ejecutar comandos
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function fixWebpackError() {
  try {
    console.log('📦 Instalando html-webpack-plugin...');
    await runCommand('npm', ['install', 'html-webpack-plugin@5.5.3', '--save-dev']);
    
    console.log('🔄 Reinstalando react-scripts...');
    await runCommand('npm', ['install', 'react-scripts@5.0.1', '--save']);
    
    console.log('✅ Dependencias instaladas correctamente');
    
    console.log('🚀 Iniciando frontend...');
    process.env.PORT = '3001';
    await runCommand('npm', ['start']);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Intenta ejecutar manualmente:');
    console.log('npm install html-webpack-plugin@5.5.3 --save-dev');
    console.log('npm install react-scripts@5.0.1 --save');
    console.log('set PORT=3001 && npm start');
    process.exit(1);
  }
}

fixWebpackError();
