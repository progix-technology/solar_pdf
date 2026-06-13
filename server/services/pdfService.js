const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Ensure uploads/pdfs directory exists
const pdfDir = path.join(__dirname, '../uploads/pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Register Handlebars helpers
handlebars.registerHelper('formatCurrency', function (value) {
  return Number(value).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });
});

handlebars.registerHelper('formatDate', function (dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const generatePDFBuffer = async (templateContent, data) => {
  try {
    // Compile Handlebars template
    const template = handlebars.compile(templateContent);
    const html = template(data);

    // Use puppeteer to generate real PDF
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};

module.exports = {
  generatePDFBuffer,
};
