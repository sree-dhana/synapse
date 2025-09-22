const pdfParse = require('pdf-parse');

async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('pdf parse error', err);
    return '';
  }
}

module.exports = { extractTextFromPdf };
