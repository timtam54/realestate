#!/usr/bin/env node

/**
 * Restores service worker version placeholder after build
 * This keeps the source file clean for version control
 */

const fs = require('fs');
const path = require('path');

// Path to service worker
const swPath = path.join(__dirname, '../public/sw.js');

// Read service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace any version number with placeholder
swContent = swContent.replace(
  /const SW_VERSION = '[^']*';/,
  "const SW_VERSION = '__SW_VERSION__';"
);

// Write back
fs.writeFileSync(swPath, swContent, 'utf8');

console.log('✅ Service worker version placeholder restored');
