#!/usr/bin/env node

// Script para iniciar el frontend en Windows sin problemas
import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Iniciando frontend de Carnes Beniken...');
console.log('📁 Directorio:', process.cwd());

// Configurar variables de entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.BROWSER = 'none'; // Evitar abrir browser automáticamente

const isWin = process.platform === 'win32';

// Comando para iniciar React
const command = isWin ? 'npm.cmd' : 'npm';
const args = ['start'];

const child = spawn(command, args, {
  stdio: 'inherit',
  shell: isWin,
  env: {
    ...process.env,
    FORCE_COLOR: '1'
  }
});

child.on('error', (error) => {
  console.error('❌ Error al iniciar frontend:', error.message);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n📊 Frontend terminado con código: ${code}`);
  process.exit(code);
});

// Manejar señales de interrupción
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo frontend...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminando frontend...');
  child.kill('SIGTERM');
});
