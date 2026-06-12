const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createDummyPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  page.drawText('Company Invoice / Quotation', { x: 50, y: 800, size: 24, color: rgb(0, 0, 0.8) });
  page.drawText('Customer Name: _________________', { x: 50, y: 700, size: 12 });
  page.drawText('Date: _________________', { x: 400, y: 700, size: 12 });
  page.drawText('Items:', { x: 50, y: 650, size: 14 });
  page.drawText('________________________________________________________________', { x: 50, y: 620, size: 12 });
  page.drawText('________________________________________________________________', { x: 50, y: 590, size: 12 });
  page.drawText('________________________________________________________________', { x: 50, y: 560, size: 12 });
  page.drawText('Total Amount: _________________', { x: 350, y: 500, size: 14, color: rgb(0.8, 0, 0) });
  
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'public', 'template.pdf');
  
  // Ensure public dir exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Dummy PDF created at', outputPath);
}

createDummyPdf();
