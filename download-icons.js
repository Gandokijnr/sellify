import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconUrl = 'https://res.cloudinary.com/dqqycsgmn/image/upload/b_rgb:FFFFFF/e_improve,e_sharpen/v1747912623/selify_fav_icon_kejjeh.png';
const publicDir = path.join(__dirname, 'public');

// Ensure the public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to download the icon
function downloadIcon(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filePath}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Download all the required icons
async function downloadAllIcons() {
  try {
    // Download the main icons
    await downloadIcon(iconUrl, path.join(publicDir, 'pwa-192x192.png'));
    await downloadIcon(iconUrl, path.join(publicDir, 'pwa-512x512.png'));
    await downloadIcon(iconUrl, path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('All icons downloaded successfully!');
    console.log('Note: You still need to create a masked-icon.svg file for Safari.');
    console.log('Please create this file manually or use a tool like RealFaviconGenerator.');
  } catch (error) {
    console.error('Error downloading icons:', error);
  }
}

// Run the download
downloadAllIcons();
