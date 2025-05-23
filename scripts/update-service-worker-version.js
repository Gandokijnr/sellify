// Service Worker Version Updater
// This script updates the APP_VERSION constant in the service worker file
// during the build process to ensure each deployment triggers updates

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const swPath = path.join(rootDir, 'public', 'sw.js');
const packageJsonPath = path.join(rootDir, 'package.json');

// Read the current package.json version
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;
const buildTime = new Date().toISOString();

console.log(`Updating service worker version to ${version} (${buildTime})`);

// Read the service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace the version constant with the new version
swContent = swContent.replace(
  /const APP_VERSION = ['"](.+)['"]/,
  `const APP_VERSION = '${version}-${buildTime.slice(0, 19).replace(/[:-]/g, '')}'`
);

// Write the updated content back to the service worker file
fs.writeFileSync(swPath, swContent);

console.log('Service worker version updated successfully!');
