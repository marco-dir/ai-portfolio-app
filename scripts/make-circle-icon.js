const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function makeCircle() {
    const inputPath = path.join(process.cwd(), 'public', 'icon.png');
    const outputPath = path.join(process.cwd(), 'public', 'icon-circle.png');

    try {
        console.log(`Processing: ${inputPath}`);

        const metadata = await sharp(inputPath).metadata();
        const size = Math.min(metadata.width, metadata.height);

        // Create a circle mask
        const circleParams = {
            width: size,
            height: size,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        };

        const circle = Buffer.from(
            `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
        );

        await sharp(inputPath)
            .resize(size, size) // Ensure square
            .composite([{
                input: circle,
                blend: 'dest-in' // Keeps only the content inside the circle
            }])
            .png()
            .toFile(outputPath);

        console.log(`Created circular icon at: ${outputPath}`);

        // Backup original and replace
        fs.renameSync(inputPath, path.join(process.cwd(), 'public', 'icon-square-backup.png'));
        fs.renameSync(outputPath, inputPath);
        console.log('Replaced icon.png with circular version');

    } catch (e) {
        console.error('Error processing image:', e);
    }
}

makeCircle();
