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
      const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Quotation_${quotationNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 6, px: { xs: 2, md: 6 } }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
          <Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1B5E20', letterSpacing: '-0.5px' }}>
              Quotations Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              Manage, edit, and download your solar proposals
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddCircleIcon />}
            onClick={() => navigate('/create-quotation')}
            sx={{
              bgcolor: '#2E7D32',
              fontWeight: 'bold',
              borderRadius: 3,
              boxShadow: '0 4px 14px 0 rgba(46, 125, 50, 0.39)',
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1.05rem',
              '&:hover': {
                bgcolor: '#1B5E20',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.23)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s'
            }}
          >
            Create New Quotation
          </Button>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{errorMsg}</Alert>}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(224, 224, 224, 0.5)'
          }}
        >
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', py: 2.5, px: 4 }}>Quotation No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', py: 2.5, px: 4 }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', py: 2.5, px: 4 }}>Customer Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', py: 2.5, px: 4 }}>Grand Total</TableCell>
                <TableCell align="center" sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem', py: 2.5, px: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                      <Typography variant="h5" color="textSecondary" fontWeight="bold" gutterBottom>
                        No quotations yet
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Click the button above to generate your very first solar proposal!
                      </Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/create-quotation')}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Get Started
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow
                    key={q._id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      '&:hover': { backgroundColor: '#f9fbf9' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, py: 2.5, px: 4, color: '#333' }}>
                      {q.quotationNumber}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 4, color: '#666' }}>
                      {new Date(q.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 4, fontWeight: 500, color: '#444' }}>
                      {q.customerName}
                    </TableCell>
                    <TableCell sx={{ py: 2.5, px: 4, fontWeight: 'bold', color: '#2E7D32', fontSize: '1.05rem' }}>
                      ₹{q.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5, px: 4 }}>
                      <IconButton
                        sx={{ color: '#1976d2', mx: 0.5, bgcolor: 'rgba(25, 118, 210, 0.05)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.15)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                        onClick={() => navigate(`/edit-quotation/${q._id}`)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        sx={{ color: '#2E7D32', mx: 0.5, bgcolor: 'rgba(46, 125, 50, 0.05)', '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.15)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                        onClick={() => openPdf(q._id, q.quotationNumber)}
                        title="Download/View PDF"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        sx={{ color: '#d32f2f', mx: 0.5, bgcolor: 'rgba(211, 47, 47, 0.05)', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.15)', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                        onClick={() => handleDelete(q._id)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default QuotationsList;
