import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function download() {
  const targetDir = path.join(__dirname, 'src', 'components');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const targetPath = path.join(targetDir, 'free-icon-clothes-7640468.png');
  const url = 'https://raw.githubusercontent.com/2green-lee/Korea-Apparel-Works/f76783eb4d5cfc7d3530a1fedd7db576efa0d0ff/free-icon-clothes-7640468.png';
  
  console.log(`Downloading original T-shirt icon to: ${targetPath}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(targetPath, buffer);
    console.log('T-shirt icon downloaded successfully!');
  } catch (error) {
    console.error('Failed to download T-shirt icon:', error);
    process.exit(1);
  }
}

download();
