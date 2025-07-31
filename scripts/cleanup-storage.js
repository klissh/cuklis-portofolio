#!/usr/bin/env node

/**
 * Script untuk menjalankan storage cleanup secara manual
 * 
 * Usage:
 * node scripts/cleanup-storage.js
 * node scripts/cleanup-storage.js --mode=old --days=30
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

// Konfigurasi
const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const API_KEY = process.env.STORAGE_CLEANUP_API_KEY;

// Parse command line arguments
const args = process.argv.slice(2);
const mode = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'unused';
const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');

if (!API_KEY) {
  console.error('❌ Error: STORAGE_CLEANUP_API_KEY environment variable is required');
  console.log('Please set it in your .env.local file');
  console.log('You can generate one using: node scripts/generate-api-key.js');
  process.exit(1);
}

console.log('🧹 Starting storage cleanup...');
console.log(`Mode: ${mode}`);
if (mode === 'old') {
  console.log(`Days: ${days}`);
}

const requestData = JSON.stringify({
  mode: mode,
  daysOld: days
});

const url = new URL(`${API_URL}/api/storage-cleanup`);
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData),
    'x-api-key': API_KEY
  }
};

const client = url.protocol === 'https:' ? https : http;

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Storage cleanup completed successfully!');
        console.log(`📊 Files deleted: ${result.deletedCount || 0}`);
        
        if (result.deletedCount > 0) {
          console.log('🎉 Storage space has been freed up!');
        } else {
          console.log('✨ No unused files found - storage is already clean!');
        }
      } else {
        console.error('❌ Error:', result.error || 'Unknown error');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(requestData);
req.end();