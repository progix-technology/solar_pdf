import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, TextField, IconButton } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, rgb } from 'pdf-lib';
import DeleteIcon from '@mui/icons-material/Delete';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfEditor = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [fields, setFields] = useState([]);
  const [pdfBytes, setPdfBytes] = useState(null);
  
  const containerRef = useRef(null);
  const [pdfScale, setPdfScale] = useState(1);

  // Load the static PDF template
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await fetch('/template.pdf');
        const arrayBuffer = await response.arrayBuffer();
        setPdfBytes(arrayBuffer);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };
    loadPdf();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Click on PDF to add a new text field
  const handlePdfClick = (e) => {
    if (!containerRef.current) return;
    
    // Calculate click position relative to the PDF container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFields([
      ...fields,
      { id: Date.now(), x, y, value: 'New Text', page: pageNumber, fontSize: 12 }
    ]);
  };

  const handleFieldChange = (id, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleFieldDelete = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  // Generate and download the filled PDF
  const handleDownload = async () => {
    if (!pdfBytes) return;

    try {
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // We assume fields are mapped to the correct page
      fields.forEach(field => {
        const page = pdfDoc.getPage(field.page - 1);
        const { width, height } = page.getSize();
        
        // Convert screen coordinates to PDF coordinates
        // React-pdf renders from top-left, pdf-lib draws from bottom-left
        // This is a simple approximation; depends on the scale rendered
        const pdfX = (field.x / pdfScale);
        const pdfY = height - (field.y / pdfScale) - field.fontSize; 
        
        page.drawText(field.value, {
          x: pdfX,
          y: pdfY,
          size: field.fontSize,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytesModified = await pdfDoc.save();
      
      // Trigger download
      const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'filled_document.pdf';
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">Interactive PDF Editor</Typography>
        <Button variant="contained" color="secondary" onClick={handleDownload} size="large">
          Download Final PDF
        </Button>
      </Box>
      
      <Typography variant="body1" color="textSecondary" mb={3}>
        Click anywhere on the PDF to add a new text field. You can then type your data into it!
      </Typography>

      <Box display="flex" gap={4}>
        {/* PDF Viewer Area */}
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'relative', 
            display: 'inline-block',
            cursor: 'crosshair',
            overflow: 'hidden'
          }}
          ref={containerRef}
        >
          <div onClick={handlePdfClick}>
            {pdfBytes && (
              <Document
                file={pdfBytes}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  onRenderSuccess={(page) => {
                     // Determine scale based on rendered width vs original width
                     const originalWidth = page.originalWidth;
                     const renderedWidth = containerRef.current.clientWidth;
                     setPdfScale(renderedWidth / originalWidth);
                  }}
                />
              </Document>
            )}
          </div>

          {/* Render Text Fields over the PDF */}
          {fields.filter(f => f.page === pageNumber).map((field) => (
            <Box
              key={field.id}
              sx={{
                position: 'absolute',
                left: field.x,
                top: field.y,
                transform: 'translate(-0%, -0%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: 2
              }}
              onClick={(e) => e.stopPropagation()} // Prevent adding a new field when clicking inside an existing one
            >
              <TextField
                variant="standard"
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                sx={{ ml: 1, minWidth: '100px' }}
                InputProps={{ disableUnderline: true, style: { fontSize: field.fontSize + 'px' } }}
                autoFocus
              />
              <IconButton size="small" color="error" onClick={() => handleFieldDelete(field.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Paper>

        {/* Sidebar Controls */}
        <Box flex={1}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Controls</Typography>
            <Typography variant="body2" mb={2}>
              Page {pageNumber} of {numPages || '--'}
            </Typography>
            <Box display="flex" gap={2} mb={4}>
              <Button 
                variant="outlined" 
                disabled={pageNumber <= 1} 
                onClick={() => setPageNumber(pageNumber - 1)}
              >
                Previous Page
              </Button>
              <Button 
                variant="outlined" 
                disabled={pageNumber >= numPages} 
                onClick={() => setPageNumber(pageNumber + 1)}
              >
                Next Page
              </Button>
            </Box>

            <Typography variant="subtitle1" fontWeight="bold">Active Fields</Typography>
            {fields.length === 0 && <Typography variant="body2" color="textSecondary">No fields added yet. Click on the PDF to start.</Typography>}
            {fields.map((f, i) => (
              <Box key={f.id} sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="body2">Field {i + 1}: {f.value}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default PdfEditor;
