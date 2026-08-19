import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Alert, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import html2pdf from 'html2pdf.js';

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  
  // Duplicate Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [targetQuotation, setTargetQuotation] = useState(null);
  const [newCustomerName, setNewCustomerName] = useState('');

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

  const openDuplicateModal = (quotation) => {
    setTargetQuotation(quotation);
    setNewCustomerName(quotation.customerName || '');
    setDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!targetQuotation) return;
    setDuplicating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/quotations/${targetQuotation._id}/duplicate`, {
        customerName: newCustomerName
      });
      setDuplicateModalOpen(false);
      setSuccessMsg(`Quotation copied successfully for "${res.data.customerName}" with new number ${res.data.quotationNumber}!`);
      await fetchQuotations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to duplicate quotation');
    } finally {
      setDuplicating(false);
    }
  };

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
      const res = await api.get(`/quotations/${id}/pdf`);
      const htmlContent = res.data;

      const opt = {
        margin: 0,
        filename: `Quotation_${quotationNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0, windowWidth: 794, width: 794, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', 'td', 'img', '.no-break'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(htmlContent).output('blob');
      const pdfBlobUrl = URL.createObjectURL(pdfBlob);

      const win = window.open(pdfBlobUrl, '_blank');
      if (!win) {
        alert('Please allow popups to view the PDF, or it will download automatically.');
        const a = document.createElement('a');
        a.href = pdfBlobUrl;
        a.download = `Quotation_${quotationNumber}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error generating/downloading PDF on frontend:', error);
      if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        alert('Server Error: ' + error.response.data);
      } else {
        alert('Failed to generate or load the PDF: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 3, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Top Header & New Quotation Button */}
        <Box sx={{ mb: 2.5, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', fontSize: '1.65rem', m: 0 }}>
                Quotations Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.88rem' }}>
                Manage, edit, duplicate, and download your solar proposals
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/create-quotation')}
              sx={{
                bgcolor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '6px',
                textTransform: 'none',
                px: 2.5,
                py: 0.9,
                fontSize: '0.88rem',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#15803d',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                },
              }}
            >
              + Create New Quotation
            </Button>
          </Box>
        </Box>

        {/* Scenic Solar Dashboard Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            mb: 3.5,
            minHeight: { xs: 180, md: 240 },
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `url('/solar-banner.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}
        >
          {/* Subtle Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(22, 101, 52, 0.90) 0%, rgba(22, 101, 52, 0.70) 50%, rgba(15, 23, 42, 0.35) 100%)',
              zIndex: 1
            }}
          />

          {/* Banner Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              px: { xs: 3, md: 5 },
              py: { xs: 3, md: 4.5 },
              width: '100%',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2.5
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, mb: 1 }}>
                <WbSunnyIcon sx={{ color: '#facc15', fontSize: 20 }} />
                <Typography sx={{ color: '#fef08a', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                  Solar Energy Management
                </Typography>
              </Box>
              <Typography sx={{ color: '#ffffff', fontWeight: 900, fontSize: { xs: '1.35rem', md: '1.75rem' }, lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                Professional Solar Quotation Portal
              </Typography>
              <Typography sx={{ color: '#dcfce7', fontSize: '0.92rem', mt: 0.8, fontWeight: 500, maxWidth: 520 }}>
                Generate, customize, and deliver premium GST-compliant solar project proposals with high precision
              </Typography>
            </Box>

            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                borderRadius: '8px',
                px: 2.5,
                py: 1.2,
                border: '1px solid rgba(255, 255, 255, 0.25)',
                textAlign: 'center',
                flexShrink: 0
              }}
            >
              <Typography sx={{ color: '#fef08a', fontWeight: 900, fontSize: '1.35rem', lineHeight: 1 }}>
                {quotations.length}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.3 }}>
                Total Proposals
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Success Banner */}
        {successMsg && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              bgcolor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              p: 1.5,
              px: 2.5,
              mb: 3
            }}
          >
            <DescriptionOutlinedIcon sx={{ color: '#16a34a', fontSize: 20, mr: 1.5 }} />
            <Typography sx={{ fontWeight: 600, color: '#166534', fontSize: '0.88rem' }}>
              {successMsg}
            </Typography>
          </Box>
        )}

        {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{errorMsg}</Alert>}

        {/* Table Container */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            bgcolor: '#ffffff'
          }}
        >
          <Table sx={{ minWidth: 700 }} size="small">
            <TableHead sx={{ bgcolor: '#166534' }}>
              <TableRow>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Quotation No
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', borderBottom: 'none' }}>
                  Grand Total
                </TableCell>
                <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 700, py: 1.4, px: 3, fontSize: '0.85rem', width: 220, borderBottom: 'none' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" color="#64748b" fontWeight="600" gutterBottom>
                        No quotations created yet
                      </Typography>
                      <Typography variant="body2" color="#94a3b8" sx={{ mb: 2.5 }}>
                        Click the button above to generate your first solar proposal!
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/create-quotation')}
                        sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 600, color: '#16a34a', borderColor: '#86efac' }}
                      >
                        Create Proposal
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
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, py: 1.8, px: 3, color: '#0f172a' }}>
                      <Chip
                        label={q.quotationNumber}
                        size="small"
                        sx={{ fontWeight: 700, bgcolor: '#f1f5f9', color: '#1e293b', borderRadius: '4px', fontSize: '0.8rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3, color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(q.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3, fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>
                      {q.customerName || '—'}
                    </TableCell>
                    <TableCell sx={{ py: 1.8, px: 3, fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>
                      ₹{q.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.8, px: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Edit Quotation" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#2563eb',
                              bgcolor: 'rgba(37, 99, 235, 0.08)',
                              borderRadius: '6px',
                              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.18)' }
                            }}
                            onClick={() => navigate(`/edit-quotation/${q._id}`)}
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Duplicate / Copy" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#d97706',
                              bgcolor: 'rgba(217, 119, 6, 0.08)',
                              borderRadius: '6px',
                              '&:hover': { bgcolor: 'rgba(217, 119, 6, 0.18)' }
                            }}
                            onClick={() => openDuplicateModal(q)}
                          >
                            <ContentCopyIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Download PDF" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#16a34a',
                              bgcolor: 'rgba(22, 163, 74, 0.08)',
                              borderRadius: '6px',
                              '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.18)' }
                            }}
                            onClick={() => openPdf(q._id, q.quotationNumber)}
                          >
                            <DownloadIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              width: 32,
                              height: 32,
                              color: '#dc2626',
                              bgcolor: 'rgba(220, 38, 38, 0.08)',
                              borderRadius: '6px',
                              '&:hover': { bgcolor: 'rgba(220, 38, 38, 0.18)' }
                            }}
                            onClick={() => handleDelete(q._id)}
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Duplicate Quotation Modal */}
      <Dialog
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        PaperProps={{ sx: { borderRadius: '10px', p: 1, minWidth: { xs: 300, sm: 420 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#0f172a', pb: 1 }}>
          Duplicate Quotation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter the customer name for the new copy. A fresh quotation number will be generated automatically.
          </Typography>
          <TextField
            autoFocus
            label="Customer Name"
            fullWidth
            size="small"
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmDuplicate();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDuplicateModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDuplicate}
            variant="contained"
            disabled={duplicating}
            sx={{
              textTransform: 'none',
              bgcolor: '#16a34a',
              fontWeight: 700,
              borderRadius: '6px',
              '&:hover': { bgcolor: '#15803d' }
            }}
          >
            {duplicating ? 'Copying...' : 'Duplicate Quotation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuotationsList;
