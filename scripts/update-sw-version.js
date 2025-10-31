#!/usr/bin/env node

/**
 * Updates service worker version with current timestamp
 * This ensures cache is cleared on every deployment
 */

const fs = require('fs');
const path = require('path');

// Generate version from current timestamp
const version = Date.now().toString();

// Path to service worker
const swPath = path.join(__dirname, '../public/sw.js');

// Read service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace version placeholder
swContent = swContent.replace('__SW_VERSION__', version);

// Write back
fs.writeFileSync(swPath, swContent, 'utf8');

console.log(`✅ Service worker version updated to: ${version}`);
console.log(`   Cache name will be: buysel-v${version}`);
