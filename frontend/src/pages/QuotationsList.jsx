import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import html2pdf from 'html2pdf.js';

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const fetchQuotations = async () => {
    try {
      const { data } = await api.get('/quotations');
      setQuotations(data);
    } catch (err) {
      setErrorMsg('Failed to load quotations');
    }

  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await api.delete(`/quotations/${id}`);
      setSuccessMsg('Quotation deleted successfully');
      fetchQuotations();
    } catch (err) {
      setErrorMsg('Failed to delete quotation');
    }
  };

  const openPdf = async (id, quotationNumber) => {
    try {
      const htmlResponse = await api.get(`/quotations/${id}/pdf`);
      const htmlContent = htmlResponse.data;

      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Wait for all images inside the container to load before capturing
      const images = container.getElementsByTagName('img');
      const imagePromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(imagePromises);

      const opt = {
        margin:       0.5,
        filename:     `Quotation_${quotationNumber}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (error.response && typeof error.response.data === 'string') {
        alert('Server Error: ' + error.response.data);
      } else {
        alert('Failed to generate or load the PDF: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">Saved Quotations</Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate('/create-quotation')}
        >
          Generate New PDF
        </Button>
      </Box>

      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell><strong>Quotation No</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Customer Name</strong></TableCell>
              <TableCell><strong>Grand Total</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No quotations found. Click "Generate New PDF" to create one.</TableCell>
              </TableRow>
            ) : (
              quotations.map((q) => (
                <TableRow key={q._id}>
                  <TableCell>{q.quotationNumber}</TableCell>
                  <TableCell>{new Date(q.quotationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{q.customerName}</TableCell>
                  <TableCell>₹{q.grandTotal.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => navigate(`/edit-quotation/${q._id}`)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="success" onClick={() => openPdf(q._id, q.quotationNumber)} title="Download/View PDF">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(q._id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuotationsList;
