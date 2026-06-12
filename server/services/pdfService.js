const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');

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

const generatePDFBuffer = async (templateContent, data) => {
  try {
    // Compile Handlebars template
    const template = handlebars.compile(templateContent);
    const html = template(data);

    // Launch Puppeteer with Chromium for serverless/Render environments
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF Buffer with proper print-quality settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px',
      },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = { generatePDFBuffer };
