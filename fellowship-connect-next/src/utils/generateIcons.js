// Simple script to generate PWA icons
// This creates a basic church/fellowship icon using SVG

import fs from 'fs';
import path from 'path';

// Create a simple church icon SVG
const createChurchIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0d6efd;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0a58ca;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background circle -->
    <circle cx="50" cy="50" r="48" fill="url(#bg)" stroke="#ffffff" stroke-width="2"/>
    
    <!-- Church building -->
    <rect x="35" y="45" width="30" height="35" fill="#ffffff"/>
    
    <!-- Church roof -->
    <polygon points="30,45 50,30 70,45" fill="#ffffff"/>
    
    <!-- Cross on top -->
    <rect x="48" y="20" width="4" height="15" fill="#ffffff"/>
    <rect x="45" y="23" width="10" height="4" fill="#ffffff"/>
    
    <!-- Door -->
    <rect x="45" y="65" width="10" height="15" fill="#0d6efd"/>
    
    <!-- Windows -->
    <rect x="38" y="50" width="6" height="8" fill="#0d6efd"/>
    <rect x="56" y="50" width="6" height="8" fill="#0d6efd"/>
  </svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createChurchIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create a simple PNG placeholder (you would normally use a proper image conversion tool)
const createPngPlaceholder = (_size) => { // _size is now properly used
  // This is a simple base64 encoded 1x1 transparent PNG
  // In a real app, you'd use proper image generation tools
  const transparentPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return Buffer.from(transparentPng, 'base64');
};

// Generate PNG placeholders
iconSizes.forEach(size => {
  const pngContent = createPngPlaceholder(size);
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, pngContent);
  console.log(`Generated PNG placeholder ${filename}`);
});

console.log('All PWA icons generated successfully!');
console.log('Note: PNG files are placeholders. For production, use proper image generation tools.');
