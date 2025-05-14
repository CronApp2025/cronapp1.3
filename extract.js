import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the zip file
const zipFilePath = path.join(__dirname, 'attached_assets', 'components.zip');
const outputDir = path.join(__dirname, 'extracted_components');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // Read the zip file
  const zip = new AdmZip(zipFilePath);
  
  // Extract all entries
  zip.extractAllTo(outputDir, true);
  
  console.log('Extraction complete. Files extracted to:', outputDir);
  
  // List extracted files
  const files = fs.readdirSync(outputDir);
  console.log('Extracted files:', files);
} catch (err) {
  console.error('Error extracting zip file:', err);
}