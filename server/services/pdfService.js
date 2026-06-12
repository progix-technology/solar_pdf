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

    // Return the raw HTML string instead of generating a PDF on the backend
    return html;
  } catch (error) {
    console.error('Error generating HTML:', error);
    throw error;
  }
};

module.exports = {
  generatePDFBuffer,
};
