/**
 * Script to generate PWA/favicon PNG icons from logo image (ICAPP Safety Teams).
 * Run: node convert-icons-to-png.js
 * Uses icons/icapp-logo.png as source; fallback to HSE text if missing.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Icon sizes required for PWA
const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Directories
const iconsDir = path.join(__dirname, 'icons');
const outputDir = iconsDir;
const logoPath = path.join(iconsDir, 'icapp-logo.png');

// Draw fallback HSE text icon (when logo file is missing)
function drawFallbackHSE(ctx, size) {
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size * 0.625)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('HSE', size / 2, size / 2);
}

// Create PNG from logo image or fallback
async function convertToPng(size) {
    try {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        if (fs.existsSync(logoPath)) {
            const img = await loadImage(logoPath);
            // Draw image scaled to fit (cover) the square, centered
            const s = Math.max(img.width, img.height);
            const dx = (size - size * (img.width / s)) / 2;
            const dy = (size - size * (img.height / s)) / 2;
            ctx.drawImage(img, dx, dy, size * (img.width / s), size * (img.height / s));
        } else {
            drawFallbackHSE(ctx, size);
        }

        const buffer = canvas.toBuffer('image/png');
        const filename = `icon-${size}x${size}.png`;
        fs.writeFileSync(path.join(outputDir, filename), buffer);
        console.log(`✓ Created ${filename}`);
    } catch (error) {
        console.error(`✗ Error creating icon-${size}x${size}.png:`, error.message);
    }
}

async function main() {
    console.log('Generating PNG icons from logo...\n');
    for (const size of iconSizes) {
        await convertToPng(size);
    }
    console.log('\n✅ All PNG icon files created successfully!');
}

main().catch(console.error);
