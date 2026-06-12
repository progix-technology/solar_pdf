import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import api from '../utils/axiosConfig';

const GeneratedQuotations = () => {
  const [quotations, setQuotations] = useState([]);

  const fetchQuotations = async () => {
    try {
      const { data } = await api.get('/quotations');
      setQuotations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await api.delete(`/quotations/${id}`);
        fetchQuotations();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openPdf = (pdfUrl) => {
    window.open(`http://localhost:5000${pdfUrl}`, '_blank');
  };

  return (
    <Box>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Generated Quotations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Quotation No.</strong></TableCell>
              <TableCell><strong>Customer</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotations.map((q) => (
              <TableRow key={q._id}>
                <TableCell>{q.quotationNumber}</TableCell>
                <TableCell>{q.customerName}</TableCell>
                <TableCell>{new Date(q.quotationDate).toLocaleDateString()}</TableCell>
                <TableCell>₹{q.grandTotal.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openPdf(q.pdfUrl)} title="View/Download PDF">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => openPdf(q.pdfUrl)} title="Print PDF">
                    <PrintIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(q._id)} title="Delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No quotations generated yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GeneratedQuotations;
