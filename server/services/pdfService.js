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
  const num = Number(value);
  if (isNaN(num)) {
    return value; // Return as-is if it's text like "TBD"
  }
  return num.toLocaleString('en-IN', {
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
    let html = template(data);

    // CRITICAL: Replace all non-breaking spaces (&nbsp;, &#160;, \u00A0) with standard spaces.
    // If the user copy-pastes text from Word/Excel, non-breaking spaces will prevent the text
    // from wrapping at the edge of the PDF, causing it to be cropped.
    html = html.replace(/&nbsp;/g, ' ');
    html = html.replace(/&#160;/g, ' ');
    html = html.replace(/\u00A0/g, ' ');

    // CRITICAL: Inject a hard 794px width lock directly into the HTML.
    // html2pdf renders content in a hidden div. Without this, the div inherits
    // the browser window width, causing white space on the right side of the PDF.
    const widthLockStyle = `<style>
      html, body { width: 794px !important; max-width: 794px !important; margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; }
      .pdf-wrapper { width: 794px !important; max-width: 794px !important; margin: 0 !important; padding: 0 !important; }
      .pdf-page { width: 794px !important; max-width: 794px !important; margin: 0 !important; padding: 0 !important; }
    </style>`;
    html = html.replace('</head>', widthLockStyle + '</head>');

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
