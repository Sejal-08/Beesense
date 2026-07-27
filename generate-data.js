import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'bee audio');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'devices.json');

function generateData() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Data directory not found: ${DATA_DIR}`);
    process.exit(1);
  }

  const devices = [];
  const folders = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const folder of folders) {
    const deviceName = folder.name;
    const devicePath = path.join(DATA_DIR, deviceName);
    const files = fs.readdirSync(devicePath)
      .filter(file => file.endsWith('.wav') || file.endsWith('.mp3'));
      
    const segments = files.map(file => {
      // Audio files are now stored in the public directory and can be accessed via relative URLs
      return {
        filename: file,
        url: `/bee audio/${deviceName}/${file}`
      };
    });

    devices.push({
      id: deviceName,
      name: deviceName.replace(/^device\s*/i, 'Device '),
      segments
    });
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(devices, null, 2));
  console.log(`Successfully generated devices.json with ${devices.length} devices.`);
}

generateData();
