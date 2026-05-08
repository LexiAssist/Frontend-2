const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgBuffer = fs.readFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'));
const outputDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('Generating favicon files...');
  
  // Generate PNG favicons
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];
  
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`Generated ${name}`);
  }
  
  // Generate favicon.ico (multi-resolution)
  // Sharp doesn't support ICO directly, so we'll use the 32x32 PNG
  // For a proper ICO, we'd need a specialized library
  // But we can create a simple ICO-like approach or use the SVG directly
  
  console.log('Favicon generation complete!');
}

generateFavicons().catch(console.error);
