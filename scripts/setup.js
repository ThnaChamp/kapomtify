const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(' Starting Kapomtify Setup...');

// 1. Install Dependencies
console.log(' Installing Server dependencies...');
execSync('npm install', { cwd: path.join(__dirname, '../server'), stdio: 'inherit' });

console.log(' Installing Client dependencies...');
execSync('npm install', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });


const envPath = path.join(__dirname, '../server/.env');
const examplePath = path.join(__dirname, '../server/.env.example');

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log(' Created .env from .env.example');
}

console.log(' Setup Complete! Now run "docker-compose up -d" to start the database.');