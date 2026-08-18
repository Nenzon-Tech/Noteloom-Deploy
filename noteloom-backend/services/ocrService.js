const Tesseract = require('tesseract.js'); 
const fs = require('fs');
const os = require('os');
const path = require('path');

const extractTextFromImage = async (buffer) => {
  try {
    // Use local traineddata when present (offline OCR); otherwise download to temp
    const localLangPath = path.join(__dirname, '..', 'tesseract_data');
    const options = {
      logger: m => {}, // Silence progress logs to keep console clean
      // This single line prevents the EROFS crash on Vercel
      cachePath: os.tmpdir() 
    };
    if (fs.existsSync(path.join(localLangPath, 'eng.traineddata'))) {
      options.langPath = localLangPath;
    }

    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', options);
    return text;
  } catch (err) {
    console.error("OCR Service Error:", err);
    return "";
  }
};

module.exports = extractTextFromImage;
